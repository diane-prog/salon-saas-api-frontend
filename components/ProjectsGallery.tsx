"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { prefersReducedMotion } from "@/lib/motion";
import { BODY, LABEL, RULE } from "@/lib/editorial";

/**
 * Galerie de réalisations, partagée par l'accueil et la page Réalisations.
 *
 * C'est le même composant aux deux endroits ; seuls les affichages proposés changent :
 * l'accueil ne garde que la vue « Fil » (`views={["feed"]}`), la page Réalisations les
 * propose tous les quatre. Quand un seul affichage est passé, la barre de choix n'est
 * pas rendue du tout — rien à cliquer, l'affichage est celui-là.
 *
 * Version « galerie » : plus d'arrondi, plus d'ombre, plus de dégradé sur les vignettes.
 * Les images sont nues, séparées par une fine gouttière, et la légende (titre + catégorie)
 * vit SOUS l'image, en petites capitales — comme une planche de contact numérotée. C'est
 * aussi plus lisible au clavier : la légende est toujours dans le flux, jamais révélée au
 * survol.
 *
 * Les affichages :
 * - `grid` : la planche de vignettes, 2 colonnes sur mobile puis 3 par ligne.
 * - `list` : un sommaire — numéro, vignette, titre, catégorie — une ligne par projet.
 * - `feed` : des fiches collantes — la fiche atteinte reste collée à sa place et la
 *   suivante la recouvre au défilement, en laissant un vrai espace vertical sous elle
 *   (les fiches ne font que 67 % de la hauteur de fenêtre) ; la fiche recouverte se
 *   rétrécit et s'efface pendant que la suivante monte dessus (STACK_STEP / STACK_HEIGHT).
 *   La légende y est une barre de papier sous l'image, à hauteur fixe : la géométrie de la
 *   pile ne dépend donc pas de la longueur du titre.
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

/**
 * Le sélecteur d'affichage : les onglets « Grille / Liste / Fil / Plein cadre ». Il est
 * exporté parce que la page Réalisations le pose DANS sa barre d'outils, à côté des filtres
 * de catégorie — voir `ProjectFilter`. Aucune mise en page n'est imposée : l'appelant passe
 * le `className` du conteneur (par défaut, une simple ligne alignée sur la ligne de base).
 */
export function GalleryViewSwitcher({
  views = ALL_VIEWS,
  view,
  onSelect,
  className = "flex items-baseline gap-x-8",
}: {
  views?: GalleryView[];
  view: GalleryView;
  onSelect: (view: GalleryView) => void;
  className?: string;
}) {
  const { dict } = useDictionary();
  const { ui } = dict;

  return (
    <div role="group" aria-label={ui.galleryViewLabel} className={className}>
      {views.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onSelect(v)}
          aria-pressed={view === v}
          className="group relative pb-1.5"
        >
          <span
            className={`${LABEL} transition-colors duration-300 ${
              view === v ? "text-ink" : "text-ink/40 group-hover:text-ink/70"
            }`}
          >
            {ui.galleryViews[v]}
          </span>
          <span
            aria-hidden
            className={`absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-300 ${
              view === v ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProjectsGallery({
  projects,
  views = ALL_VIEWS,
  label,
  view: controlledView,
  onViewChange,
}: {
  projects: GalleryProject[];
  /** Affichages proposés, dans l'ordre de la barre. Un seul = aucun choix affiché. */
  views?: GalleryView[];
  /** Sur-titre de la barre ; `null` pour n'afficher que les onglets. */
  label?: string | null;
  /**
   * Vue pilotée de l'extérieur. Quand elle est fournie, le composant n'affiche plus sa
   * propre barre de choix : elle est rendue par l'appelant (`GalleryViewSwitcher`), pour
   * tenir sur la même ligne que ses autres contrôles.
   */
  view?: GalleryView;
  onViewChange?: (view: GalleryView) => void;
}) {
  const { locale } = useDictionary();
  const [ownView, setOwnView] = useState<GalleryView>(views[0]);
  const view = controlledView ?? ownView;
  const setView = (next: GalleryView) => {
    setOwnView(next);
    onViewChange?.(next);
  };
  const stackRef = useRef<HTMLUListElement>(null);

  /* La barre intégrée ne sert qu'aux appelants qui ne pilotent pas la vue eux-mêmes. */
  const switcher = controlledView === undefined && views.length > 1;

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
        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
          {label ? <span className={`${LABEL} text-ink/45`}>{label}</span> : null}

          <GalleryViewSwitcher views={views} view={view} onSelect={setView} />
        </div>
      ) : null}

      <div key={view} className="relative mt-10">
        {/* ——— Grille : des images nues, leur légende dessous. ——— */}
        {view === "grid" ? (
          <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.title}>
                <Plate href={`/${locale}/realisations`} project={project} ratio="aspect-[4/5]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </li>
            ))}
          </ul>
        ) : null}

        {/* ——— Liste : un sommaire, une ligne par projet. ——— */}
        {view === "list" ? (
          <ul className={`border-t ${RULE}`}>
            {projects.map((project, i) => (
              <li key={project.title} className={`border-b ${RULE}`}>
                <Link
                  href={`/${locale}/realisations`}
                  className="group flex items-center gap-5 py-4 transition-colors duration-300 hover:bg-ink/[0.03] sm:gap-8"
                >
                  <span className={`w-6 shrink-0 ${LABEL} tabular-nums text-ink/35`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-ink/[0.06] sm:h-16 sm:w-16">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${BODY} text-ink`}>{project.title}</span>
                    <span className={`mt-1 block ${LABEL} text-ink/45`}>{project.category}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {/* ——— Fil : les fiches collent l'une après l'autre. Chaque `<li>` est `sticky`
            avec son propre `top`, un cran plus bas que le précédent : la fiche atteinte
            reste collée et la suivante la recouvre, en laissant dépasser la bande du haut
            de toutes les précédentes. Elles collent toutes dans le même parent, donc
            aucune n'est relâchée avant la fin de la pile. `marginBottom` creuse l'écart
            entre deux fiches. Pas de `Reveal` : son fondu au scroll pose un `transform`
            sur l'ancêtre de la fiche, ce qui la priverait de son `sticky`. ——— */}
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
                  {/* Fiche de hauteur fixe : l'image prend la place restante, la légende
                      garde la même hauteur quelle que soit la longueur du titre — la
                      géométrie de la pile ne bouge donc jamais. */}
                  <Link
                    href={`/${locale}/realisations`}
                    className="group flex h-[67svh] w-full flex-col overflow-hidden bg-white"
                  >
                    <span className="relative block flex-1 overflow-hidden bg-ink/[0.06]">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(min-width: 80rem) 80rem, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </span>
                    <span className={`flex items-baseline justify-between gap-6 border-t px-5 py-4 ${RULE}`}>
                      <span className={`${BODY} text-ink`}>{project.title}</span>
                      <span className={`${LABEL} shrink-0 text-ink/45`}>{project.category}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

        {/* ——— Plein cadre : mêmes vignettes, gouttière réduite à un filet. ——— */}
        {view === "full" ? (
          <ul className="grid grid-cols-2 gap-px bg-navy/10 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.title} className="bg-white">
                <Plate href={`/${locale}/realisations`} project={project} ratio="aspect-square" sizes="(max-width: 1024px) 50vw, 33vw" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

/**
 * Vignette « planche » : image nue (aucun cadre, aucun arrondi, aucune ombre) et sa
 * légende en dessous. Le survol — ou la prise de focus, pour le clavier — resserre très
 * légèrement l'image et fait glisser la flèche ; rien d'autre ne s'anime.
 */
function Plate({
  href,
  project,
  ratio,
  sizes,
}: {
  href: string;
  project: GalleryProject;
  ratio: string;
  sizes: string;
}) {
  return (
    <Link href={href} className="group block">
      <span className={`relative block overflow-hidden bg-ink/[0.06] ${ratio}`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </span>
      <span className={`mt-4 flex items-baseline justify-between gap-6 border-t pt-3 ${RULE}`}>
        <span className={`${BODY} text-ink`}>{project.title}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className={`${LABEL} text-ink/45`}>{project.category}</span>
          <ArrowRight className="h-3.5 w-3.5 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" />
        </span>
      </span>
    </Link>
  );
}
