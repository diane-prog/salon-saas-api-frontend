"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Galerie de réalisations, partagée par l'accueil et la page Réalisations.
 *
 * C'est le même composant aux deux endroits ; seuls les affichages proposés changent :
 * l'accueil ne garde que la vue « Fil » (`views={["feed"]}`), la page Réalisations les
 * propose tous les quatre. Quand un seul affichage est passé, la barre de choix n'est
 * pas rendue du tout — rien à cliquer, l'affichage est celui-là.
 *
 * Conforme à la référence : AUCUN cadre, AUCUN arrondi, aucune ligne. Les vignettes sont
 * des images nues posées sur le fond, séparées par une simple gouttière ; le titre et la
 * catégorie n'apparaissent qu'au survol (au repos, l'image seule), de même que la pastille
 * flèche. C'est aussi plus lisible au clavier : `group-focus-visible` déclenche les mêmes
 * révélations qu'un survol.
 *
 * Les affichages :
 * - `grid` : la planche de vignettes, régulière, 2 colonnes sur mobile puis 3 par ligne.
 * - `list` : un sommaire — numéro, vignette, titre, catégorie — une ligne par projet.
 * - `feed` : des fiches collantes — la fiche atteinte reste collée à sa place et la
 *   suivante la recouvre au défilement, en laissant un vrai espace vertical sous elle
 *   (les fiches ne font que 67 % de la hauteur de fenêtre) ; la fiche recouverte se
 *   rétrécit et s'efface pendant que la suivante monte dessus (STACK_STEP / STACK_HEIGHT).
 * - `full` : les mêmes vignettes en plein cadre, bord à bord.
 *
 * Le choix vit dans l'état du composant (aucun rechargement, aucun paramètre d'URL) et
 * les vues sont remontées à chaque changement (`key`) pour rejouer la révélation.
 */

export type GalleryView = "grid" | "list" | "feed" | "full";

export const ALL_VIEWS: GalleryView[] = ["grid", "list", "feed", "full"];

export type GalleryProject = {
  title: string;
  body: string;
  category: string;
  image: string;
};

/**
 * Vue « Fil » : les réglages de la pile. Tout est exprimé en fraction de la hauteur de
 * fenêtre — y compris les collages — pour que la géométrie soit la même sur toutes les
 * fenêtres (plus de mélange rem/svh à recalculer).
 *
 * `PIN_BASE` : hauteur à laquelle la première fiche se colle (sous le header).
 * `STACK_STEP` : décalage d'un collage au suivant, donc épaisseur de la bande qu'une
 *   fiche recouverte laisse voir avant de disparaître.
 * `STACK_HEIGHT` : hauteur d'une fiche.
 * `STACK_GAP` : écart entre deux fiches — la suivante monte d'abord détachée du bas de
 *   la fiche collée, puis l'écart se referme et elle glisse par-dessus. Il découle des
 *   deux autres valeurs : c'est ce qui reste sous la fiche collée quand elle s'arrête
 *   (100 − collage − hauteur). Réduire l'écart = coller plus bas ou faire les fiches
 *   plus hautes ; ici il vaut 15 %.
 */
const PIN_BASE = 18; // % de fenêtre
const STACK_STEP = 2.5; // % de fenêtre
const STACK_HEIGHT = 0.67; // fraction de fenêtre
const STACK_GAP = 1 - PIN_BASE / 100 - STACK_HEIGHT; // fraction de fenêtre (0,15)

export default function ProjectsGallery({
  projects,
  views = ALL_VIEWS,
  label,
}: {
  projects: GalleryProject[];
  /** Affichages proposés, dans l'ordre de la barre. Un seul = aucun choix affiché. */
  views?: GalleryView[];
  /** Sur-titre de la barre ; `null` pour n'afficher que les onglets. */
  label?: string | null;
}) {
  const { dict, locale } = useDictionary();
  const { ui } = dict;
  const [view, setView] = useState<GalleryView>(views[0]);
  const stackRef = useRef<HTMLUListElement>(null);

  const switcher = views.length > 1;

  /**
   * L'effet de la pile : la fiche recouverte se rétrécit et disparaît pendant que la
   * suivante monte sur elle. Il est piloté par GSAP/ScrollTrigger plutôt que par les
   * animations natives liées au défilement (`animation-timeline`), pour deux raisons :
   * d'abord parce que celles-ci ne sont pas encore disponibles partout — ici l'effet se
   * joue à coup sûr ; ensuite parce que le défilement du site passe par Lenis, qui est
   * déjà synchronisé avec ScrollTrigger (voir `SmoothScroll`), donc l'effet suit la même
   * horloge que le reste des animations du site. `scrub` lie l'avancement au doigt et à l'œil.
   *
   * Le tween observe la fiche SUIVANTE : la réduction démarre quand son bord haut touche
   * le bas de la fiche collée (qui ne bouge plus, elle est en `sticky`) et se termine
   * quand elle atteint sa propre hauteur d'arrivée. `start`/`end` sont des fonctions :
   * elles sont recalculées à chaque `refresh` (redimensionnement, changement de vue).
   */
  useEffect(() => {
    if (view !== "feed") return;
    const list = stackRef.current;
    if (!list) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Les `top` des fiches sont en svh : on retrouve le même repère en pixels. */
    const vh = window.innerHeight / 100;
    const pinTop = (i: number) => (PIN_BASE + i * STACK_STEP) * vh;
    const cards = Array.from(list.children) as HTMLElement[];

    const tweens = cards.slice(0, -1).map((card, i) =>
      gsap.fromTo(
        card,
        { scale: 1, opacity: 1 },
        {
          scale: 0.9,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: () => `top ${pinTop(i) + card.offsetHeight}px`,
            end: () => `top ${pinTop(i + 1)}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      ),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      for (const card of cards) gsap.set(card, { clearProps: "transform,opacity" });
    };
  }, [view]);

  return (
    <>
      {switcher ? (
        <div
          className={`relative mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 ${
            label ? "justify-between" : "justify-end"
          }`}
        >
          {label ? (
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-navy/45">
              {label}
            </span>
          ) : null}

          <div
            role="group"
            aria-label={ui.galleryViewLabel}
            className="flex items-center justify-between gap-7 sm:justify-start sm:gap-10"
          >
            {views.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`relative pb-1 text-sm font-light transition-colors duration-300 ${
                  view === v ? "text-navy" : "text-muted hover:text-navy"
                }`}
              >
                {ui.galleryViews[v]}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-navy transition-transform duration-300 ${
                    view === v ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div key={view} className="relative mt-10">
        {view === "grid" ? (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title} delay={i * 60}>
                <Tile
                  href={`/${locale}/realisations`}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  className="aspect-[4/5]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}

        {view === "list" ? (
          <ul className="flex flex-col gap-2">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title}>
                <Link
                  href={`/${locale}/realisations`}
                  className="group flex items-center gap-4 px-3 py-4 transition-colors duration-300 hover:bg-white/45 sm:gap-6 sm:px-5"
                >
                  <span className="w-6 shrink-0 text-xs tabular-nums text-navy/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-navy/10 sm:h-16 sm:w-16">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-light text-navy">
                      {project.title}
                    </span>
                    <span className="mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted">
                      {project.category}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-navy/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy" />
                </Link>
              </Reveal>
            ))}
          </ul>
        ) : null}

        {/* Vue « Fil » : les fiches collent l'une après l'autre. Chaque `<li>` est
            `sticky` avec son propre `top`, un cran plus bas que le précédent : la fiche
            atteinte reste collée à sa place et la suivante la recouvre, en laissant
            dépasser la bande du haut de toutes les précédentes. Elles collent toutes
            dans le même parent, donc aucune n'est relâchée avant la fin de la pile.
            `marginBottom` creuse l'écart entre deux fiches : la suivante monte d'abord
            détachée du bas de la fiche collée, l'écart se referme, puis elle glisse
            par-dessus. Puis l'effet décrit plus haut (le `useEffect` du composant) : la
            fiche recouverte se rétrécit et disparaît pendant que la suivante la recouvre,
            si bien qu'aucune bande recouverte ne s'empile à l'écran.
            Pas de `Reveal` : son fondu au scroll pose un `transform` sur l'ancêtre de la
            fiche, ce qui la priverait de son `sticky`. */}
        {view === "feed" ? (
          <ul ref={stackRef} className="relative">
            {projects.map((project, i) => {
              const last = i === projects.length - 1;

              return (
                <li
                  key={project.title}
                  className="stack-card sticky"
                  style={
                    {
                      top: `calc(${PIN_BASE}svh + ${i * STACK_STEP}svh)`,
                      zIndex: i + 1,
                      marginBottom: last ? undefined : `${(STACK_GAP * 100).toFixed(2)}svh`,
                    } as React.CSSProperties
                  }
                >
                  <Tile
                    href={`/${locale}/realisations`}
                    title={project.title}
                    category={project.category}
                    image={project.image}
                    /* 67svh : doit rester égal à `STACK_HEIGHT`. */
                    className="aspect-[4/5] sm:aspect-auto sm:h-[67svh]"
                    sizes="(min-width: 80rem) 80rem, 100vw"
                  />
                </li>
              );
            })}
          </ul>
        ) : null}

        {view === "full" ? (
          <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title} delay={i * 50}>
                <Tile
                  href={`/${locale}/realisations`}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  className="aspect-square"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

/**
 * Vignette : image nue (aucun cadre, aucun arrondi). Le survol — ou la prise de focus,
 * pour le clavier — fait apparaître un léger voile, le titre, la catégorie et la flèche.
 */
function Tile({
  href,
  title,
  category,
  image,
  className,
  sizes,
}: {
  href: string;
  title: string;
  category: string;
  image: string;
  className: string;
  sizes: string;
}) {
  const reveal =
    "opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100";

  return (
    <Link
      href={href}
      className={`group relative block w-full overflow-hidden bg-navy/[0.06] ${className}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <span
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent ${reveal}`}
      />

      <span
        aria-hidden
        className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ${reveal}`}
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>

      <span
        className={`absolute inset-x-4 bottom-4 translate-y-2 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 ${reveal}`}
      >
        <span className="block text-sm font-light leading-snug text-white sm:text-base">
          {title}
        </span>
        <span className="mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/70">
          {category}
        </span>
      </span>
    </Link>
  );
}
