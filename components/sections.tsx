"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import Parallax from "@/components/Parallax";
import Counter from "@/components/Counter";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { prefersReducedMotion } from "@/lib/motion";
import { LABEL } from "@/lib/editorial";
import { useDictionary } from "@/components/DictionaryProvider";

export function HeroSection({
  eyebrow,
  title,
  highlight,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  /** Chapô sous le titre. Optionnel : la page À propos porte son texte d'ouverture dans
      le premier bloc de contenu, comme sur le site de référence. */
  body?: string;
  children?: ReactNode;
}) {
  /* Hero clair des pages internes : fond photo `other-hero` (fond gris, portrait à
     droite), grand titre foncé, paragraphe révélé mot à mot par la couleur.

     Trois couches posées sous le texte, dans cet ordre :
     1. la photo — bande en bas sur mobile (le texte reste sur le fond uni), plein
        cadre dès `sm` ; elle glisse en parallaxe (GSAP) sous le texte ;
     2. un voile clair de gauche à droite : les titres longs ne tombent jamais sur
        les cheveux foncés ;
     3. un léger dégradé noir depuis le haut, sur TOUT le hero : le header, toujours
        blanc au repos sur tout le site, reste lisible sur ce fond clair, et le bas
        du dégradé s'efface au fur et à mesure que le texte apparaît. */
  return (
    <section className="relative overflow-hidden bg-[#f1f2f2] pt-36 pb-64 sm:pt-92 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden sm:inset-0 sm:h-auto"
      >
        {/* Le cadre déborde de 8 % en haut et en bas : la photo peut glisser de ±5 % au
            défilement sans jamais découvrir un bord (la boîte clippe le débattement). */}
        <Parallax className="absolute -inset-y-[8%] inset-x-0" amount={5} scale={1.04}>
          <Image
            src="/img/other-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-center"
          />
        </Parallax>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[58%] w-full bg-gradient-to-r from-[#f1f2f2] via-[#f1f2f2]/70 to-transparent sm:h-full sm:w-[62%] sm:via-[#f1f2f2]/85"
      />
      {/* Assombrissement sous le header — mais SUR MOBILE, seulement une bande courte.

          Le header est blanc au repos : sur ce fond clair il a besoin d'un fond sombre
          derrière lui. Sur un écran large, ce voile peut couvrir tout le hero, parce que le
          titre est repoussé sur la gauche par le dégradé clair. Sur un téléphone, la même
          bande pleine hauteur tombe PILE sur le titre bleu nuit, qui devient illisible —
          c'est ce qui se voyait mal. D'où deux voiles : une bande de 6 rem sous le header
          sous `sm`, le voile complet au-dessus. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent sm:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-black/70 via-black/45 to-transparent sm:block"
      />

      <div className="container-x relative">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gray-700">
            {eyebrow}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          {/* Même graisse et mêmes tailles que le titre de l'accueil (`HomeHero`) : le
              hero clair des pages internes suit la même échelle typographique, seul le
              fond change. */}
          <SplitText
            as="h1"
            text={title}
            accent={highlight}
            accentClassName="text-gradient"
            delay={0.08}
            className="font-light text-4xl leading-[1.06] text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.02]"
          />
          {body && (
            <SplitText
              as="p"
              text={body}
              reveal="color"
              delay={0.25}
              stagger={0.025}
              duration={0.5}
              className="max-w-xl text-base leading-relaxed text-navy sm:text-lg"
            />
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function KeywordMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-white/10 bg-navy-deep/40 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy to-transparent" />
      <div className="flex shrink-0 animate-marquee items-center gap-10 whitespace-nowrap pr-10">
        {row.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-10 text-sm font-medium uppercase tracking-[0.22em] text-white/35">
            {word}
            <span className="h-1.5 w-1.5 rounded-full bg-turquoise/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * La fleur de marque, en un seul exemplaire : elle sert de badge dans la section
 * témoignages et de SÉPARATEUR dans le ruban des chiffres. Un motif de la maison plutôt
 * qu'un point générique, et une seule source si sa forme change.
 */
function Flower({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      <path d="M100 22c15 0 24 10 30 18 10-3 22-1 28 10 6 10 2 22-5 29 7 7 11 19 5 29-6 11-18 13-28 10-6 8-15 18-30 18s-24-10-30-18c-10 3-22 1-28-10-6-10-2-22 5-29-7-7-11-19-5-29 6-11 18-13 28-10 6-8 15-18 30-18Z" />
    </svg>
  );
}

type Stat = { value: number; suffix: string; label: string };

/**
 * Leegi en chiffres — le BLOC DES RÉSULTATS, sur le plan qui a remplacé celui des services.
 *
 * Il n'a NI fond NI média : c'est le dernier temps de `ServicesGlass`, posé sur le cadre
 * collé de la section dont le plan vient d'être remplacé par un fondu (voir `ServicesGlass`,
 * qui porte la seconde couche — `hero7.png` + `video1.mp4` — et son opacité de défilement).
 * Tout ce qui suit est donc écrit pour se lire SUR UNE IMAGE : texte clair, filets
 * `white/15`, ombre douce sous les mots.
 *
 * Deux partis, repris de la référence :
 *
 *   1. la copie en bas à gauche — le TITRE d'abord, révélé mot à mot (`SplitText`, comme
 *      tous les grands titres du site), puis le chapô et l'action vers les réalisations.
 *      Plus de pastille de sur-titre : elle alourdissait un bloc qui doit aller droit au
 *      chiffre, et l'information est déjà dans le titre ;
 *   2. les CARTES en bas : une rangée qui DÉFILE EN CONTINU, rognée par les DEUX FILETS du
 *      cadre — les tuiles passent derrière les règles, qui restent nettes. Le geste du ruban
 *      de mots-clés, avec les chiffres dedans.
 *
 * Le CADRE, justement : les mêmes filets verticaux que la section services (`max-w-[80rem]`,
 * `border-white/15`), et il MONTE jusqu'au bord haut du bloc — l'espace du haut est porté par
 * le cadre, jamais par le bloc. La colonne encadrée traverse donc les services ET les
 * résultats sans interruption, comme une seule grille.
 *
 * La boucle est celle du site (`animate-marquee`, `translateX(0)` → `-50 %`), et les trois
 * conditions de sa justesse sont tenues : SIX copies de la suite (un nombre PAIR, sinon le
 * saut tomberait au milieu d'une copie), `pr-*` égal à `gap-*` (l'écart de reprise est alors
 * mesuré au pixel) et `w-max` sur la piste. La piste sort du cadre et va d'un bord à l'autre
 * de la FENÊTRE, donc la moitié de la suite — trois copies, ≈ 4 560 px — doit couvrir un
 * écran entier, largeurs d'écran ultrapanoramiques comprises ; quatre copies ne tenaient
 * plus qu'à 1 280 px de cadre. Les copies au-delà de la première sont `aria-hidden` : les
 * cinq chiffres ne sont pas annoncés six fois. La rangée s'arrête au survol, le temps de lire.
 */
export function StatsSection({
  title,
  body,
  linkHref,
  linkLabel,
  stats,
}: {
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
  stats: Stat[];
}) {
  const row = [...stats, ...stats, ...stats, ...stats, ...stats, ...stats];

  return (
    <div className="relative min-h-[100svh] text-white">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[80rem] flex-col justify-end gap-12 border-x border-white/15 pt-32 pb-12 sm:gap-16 sm:pb-16">
        <Reveal className="flex max-w-2xl flex-col items-start gap-6 px-5 sm:px-8 lg:px-10">
          <SplitText
            as="h2"
            text={title}
            breakAfter={2}
            delay={0.06}
            className="font-light text-4xl leading-[1.06] tracking-tight [text-shadow:0_2px_18px_rgb(0_0_0_/_0.4)] sm:text-5xl lg:text-[3.25rem]"
          />

          <p className="max-w-md text-base leading-relaxed text-white/70 [text-shadow:0_1px_12px_rgb(0_0_0_/_0.4)]">
            {body}
          </p>

          <ButtonLink href={linkHref} variant="glass" className="mt-1">
            {linkLabel}
          </ButtonLink>
        </Reveal>

        {/* La rangée qui défile : elle QUITTE le cadre — marge négative calculée depuis le
            cadre centré + `w-screen`, donc elle court d'un bord à l'autre de la fenêtre et
            les cartes sortent totalement de la zone de grille, coupées aux bords de la page.
            Le débord est lui-même rogné par `overflow-clip` de la section (le `100vw` inclut la
            largeur de la barre de défilement), donc aucun défilement horizontal n'est créé. */}
        <Reveal delay={120}>
          <div className="ml-[calc(50%_-_50vw)] w-screen overflow-hidden">
            <ul className="flex w-max animate-marquee items-stretch gap-3 pr-3 hover:[animation-play-state:paused] sm:gap-4 sm:pr-4">
              {row.map((stat, i) => (
                <StatCard key={`${stat.label}-${i}`} stat={stat} hidden={i >= stats.length} />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/** Croix d'angle de la référence (quatre par tuile). */
function PlusMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden>
      <path d="M6 0.5v11M0.5 6h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Tuile du ruban : verre, croix d'angle, chiffre en grand thin, filet, libellé.
 *
 * Largeur FIXE : dans une piste en `w-max`, une tuile dimensionnée par son texte donnerait
 * une piste de largeur imprévisible — « la moitié » de la boucle ne tomberait plus au pixel.
 * La hauteur, elle, est commune à toute la rangée (`items-stretch` sur la piste). La tuile
 * est plus opaque que celle des services (`bg-ink/35` + `backdrop-blur-sm`, flou d'origine
 * fortement réduit) : elle passe sur
 * une VIDÉO qui bouge, et doit rester lisible image par image.
 */
function StatCard({ stat, hidden = false }: { stat: Stat; hidden?: boolean }) {
  return (
    <li
      aria-hidden={hidden}
      className="relative flex min-h-[10.5rem] w-[15rem] shrink-0 flex-col justify-between gap-6 border border-white/15 bg-ink/35 p-5 backdrop-blur-sm sm:min-h-[12rem] sm:w-[18rem] sm:p-6"
    >
      <PlusMark className="absolute left-2 top-2 h-3 w-3 text-white/30" />
      <PlusMark className="absolute right-2 top-2 h-3 w-3 text-white/30" />
      <PlusMark className="absolute bottom-2 left-2 h-3 w-3 text-white/30" />
      <PlusMark className="absolute bottom-2 right-2 h-3 w-3 text-white/30" />

      <span className="text-4xl font-light tracking-tight tabular-nums [text-shadow:0_2px_18px_rgb(0_0_0_/_0.35)] sm:text-5xl">
        <Counter value={stat.value} suffix={stat.suffix} />
      </span>

      <span className={`${LABEL} border-t border-white/15 pt-4 text-white/70`}>{stat.label}</span>
    </li>
  );
}

/* La grille de cartes de services (`ServiceGrid`) a été remplacée par la table éditoriale
   de `components/ServicesTable`, seule utilisée par la page Services. */

/**
 * Témoignages clients, style « Trusted by Clients » de la référence :
 *
 * - fonds `ink` (le noir neutre du projet, celui du pied de page) et cartes papier :
 *   en-tête à gauche + deux flèches rondes à droite ;
 * - UN SEUL accent dans toute la section, le bleu de marque — les étoiles et la fleur.
 *   Plus de noir pur, plus de gris en dur (`#1c1c1c` / `#181818`), plus d'orange, plus de
 *   double couche sous les cartes : tout vient des jetons du thème (`navy`, `paper`, `ink`,
 *   `brand`), comme le reste du site — un noir pur et un orange sans rapport avec la marque
 *   se lisaient comme une autre identité collée dans la page ;
 * - fleur à la couleur brand au centre-bas avec « CLIENT STORIES » ; au scroll elle S'AGRANDIT
 *   jusqu'à couvrir le bas de la section (le libellé grossit avec elle) — l'échelle
 *   dérive de la position de la section dans le viewport, pas d'un timer ;
 *   à la remontée la progression redescend, donc la fleur RÉTRÉCIT et retrouve sa
 *   taille de repos une fois la section revenue en bas du viewport ;
 * - mouvement réduit : la fleur reste à sa taille de repos, tout reste lisible.
 */
export function TestimonialsSection() {
  const { dict } = useDictionary();
  const root = useRef<HTMLElement>(null);
  /* Valeur lissée de la progression, persistée entre les frames (lerp). */
  const smoothed = useRef(0);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const blob = section.querySelector<HTMLElement>("[data-stories-blob]");
    const label = section.querySelector<HTMLElement>("[data-stories-label]");
    /* La MESURE se fait sur le conteneur, jamais sur la fleur : le rect d'un
       élément transformé est renvoyé DÉJÀ transformé. En lisant `blob`, un
       scale(18) remontait son `top` de ~1200 px et la progression restait
       bloquée à 1 à la remontée (la fleur ne rétrécissait plus). Le conteneur,
       lui, n'est jamais transformé : sa position reflète le layout réel. */
    const anchor = section.querySelector<HTMLElement>("[data-stories-anchor]");
    if (!blob || !label || !anchor) return;

    /* Échelle finale ciblée : la fleur doit couvrir LE BAS DE LA SECTION — pas
       l'écran entier. La hauteur de la zone basse ≈ 16rem (badge + paddings) ; la
       fleur de 9rem doit faire ~160rem de large pour couvrir tous les angles de
       cette bande : scale final 18 suffit, on reste sobre.

       Mais 18 est un réglage de GRAND ÉCRAN. Sur un téléphone, la fleur de 144 px
       ferait 2 600 px de large et son libellé 180 px de haut : le bas de la section
       devenait un aplat bleu et « Client Stories » sortait de toute mesure. L'échelle
       se dérive donc de la LARGEUR de la fenêtre, avec un plancher — 3,4 × est le
       minimum pour couvrir 390 px de large — et le libellé suit la même proportion,
       pour que le mot reste lisible au lieu de grossir indépendamment du fond. */
    const update = () => {
      const badge = anchor.getBoundingClientRect();
      const view = window.innerHeight;
      const startLine = view * 0.6;
      const endLine = view * 0.05;
      /* Parcours du badge entre les deux lignes — ET lissage : le progress brut est
         adouci par une courbe easeOut (démarrage doux, fin douce), puis lissé à
         nouveau par un amorti temporel (lerp) : le mouvement est CONTINU, plus de
         sauts brutal quand on scrolle vite. À la remontée, la valeur suit et
         redéscend progressivement — le retour est symétrique. */
      const travelled = startLine - badge.top;
      const total = startLine - endLine;
      const raw = Math.min(1, Math.max(0, travelled / total));
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(2 - 2 * raw, 2) / 2;
      /* Lerp : on ne saute jamais à la nouvelle valeur, on glisse vers elle. */
      smoothed.current += (eased - smoothed.current) * 0.16;
      if (Math.abs(eased - smoothed.current) < 0.001) smoothed.current = eased;
      const progress = smoothed.current;
      /* Couvre la largeur de la fenêtre, plafonné à 18 : 3,4 × sur un téléphone,
         ~14 × sur un écran de bureau de 1440 px, 18 au-delà. */
      const scaleMax = Math.min(18, Math.max(3.4, (window.innerWidth / 144) * 1.4));
      const scale = 1 + progress * (scaleMax - 1);
      blob.style.transform = `scale(${scale}) rotate(${progress * 180}deg)`;
      /* Pas de translate ici : en Tailwind v4, `-translate-x-1/2 -translate-y-1/2`
         s'applique via la propriété `translate` (indépendante de `transform`),
         donc le centrage du libellé survit à ce transform — le dupliquer ici
         décalait le texte de ~41 px. */
      /* Le libellé suit la fleur : à l'échelle 18 il monte à 8 × (comme avant), à
         l'échelle 3,4 il ne monte qu'à 2,3 × — lisible sur un téléphone. */
      label.style.transform = `scale(${1 + progress * scaleMax * 0.39})`;
    };
    if (prefersReducedMotion()) return;

    /* Lenis pilote la page via des transforms : l'événement `scroll` natif n'est pas
       fiable ici. On rafraîchit donc en boucle rAF — la mesure est ainsi toujours à
       jour, dans les deux sens (descente ET remontée).

       Mais la boucle ne tourne QUE quand la section approche de l'écran (une demi-fenêtre
       de marge, pour que la fleur soit déjà à jour quand elle arrive). Une boucle qui
       mesure et écrit une transformation à chaque frame, y compris quand la section est
       hors écran, coûte des frames au défilement de toute la page : c'est exactement ce
       qu'on ne veut pas d'un site qu'on parcourt au scroll. */
    let frame = 0;
    let running = false;
    const tick = () => {
      if (!running) return;
      update();
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const arrow = (d: string, flip = false) => (
    <span className="grid h-11 w-11 place-items-center rounded-full border border-paper/25 text-paper/75 transition-colors duration-300 hover:border-paper/70 hover:text-paper">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${flip ? "scale-x-[-1]" : ""}`}
        aria-hidden
      >
        <path d={d} />
      </svg>
    </span>
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-ink/90 py-24 sm:py-28"
    >
      <div className="container-x relative z-10">
        {/* En-tête : titre + sous-titre à gauche, flèches rondes à droite. */}
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-light tracking-tight text-paper sm:text-5xl">
              {dict.ui.testimonialTitle}
            </h2>
            <p className="mt-3 text-sm text-paper/50">{dict.ui.testimonialBody}</p>
          </div>
          <div className="hidden shrink-0 gap-3 sm:flex">
            {arrow("M14 6l-6 6 6 6", true)}
            {arrow("M10 6l6 6-6 6")}
          </div>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.testimonials.slice(0, 3).map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 80} className="relative">
              {/* Une seule carte, opaque : c'est le papier du site posé sur le navy, avec
                  un filet — ni relief ni doublure décalée. */}
              <figure className="relative flex h-full flex-col gap-5 bg-paper p-7 ring-1 ring-navy/10">
                <div className="flex items-start justify-between gap-3">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={52}
                    height={52}
                    className="h-13 w-13 rounded-lg object-cover"
                  />
                  <span className="mt-1 text-[0.7rem] font-light uppercase tracking-[0.14em] text-ink/45">
                    {dict.clients[i % dict.clients.length]}
                  </span>
                </div>

                <blockquote className="text-[1.05rem] leading-relaxed text-ink">
                  “{t.quote}”
                </blockquote>

                {/* Étoiles au bleu de marque : c'est l'accent de la section (la fleur du
                    bas l'utilise aussi) — plus l'orange, qui n'appartenait qu'à cette
                    section et jurait avec le reste du site. */}
                <div className="flex gap-1" aria-hidden>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="h-4 w-4 fill-brand">
                      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
                    </svg>
                  ))}
                </div>

                <div aria-hidden className="mt-2 h-px w-8 bg-ink/20" />
                <figcaption>
                  <p className="text-base font-light text-ink">{t.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/45">
                    {t.role}
                    <br />
                    {t.company}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Le badge : fleur + texte, comme Orisa. EN FLUX NORMAL après les cartes — le
          petit cercle est VISIBLE au repos (le bug signalé : il était caché sous les
          cartes via une marge négative, retirée). Deux points-clés d'Orisa conservés :
          1) badge à z-index inférieur — quand il grossit, le fond brand passe derrière les
          cartes déjà scrollées hors champ, jamais devant ;
          2) la section clippe : à fin de course le brand couvre le bas, le noir avalé. */}
      <div data-stories-anchor className="relative z-0 mt-14 flex justify-center pb-24">
        <div data-stories-blob className="flex items-center justify-center">
          <Flower className="h-36 w-36 fill-brand" style={{ willChange: "transform" }} />
        </div>
        <span
          data-stories-label
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-light uppercase leading-[1.02] tracking-tight text-white"
          style={{ fontSize: "1.4rem", willChange: "transform" }}
        >
          Client
          <br />
          Stories
        </span>
      </div>
    </section>
  );
}

export function SplitShowcase({
  eyebrow,
  title,
  body,
  points,
  image,
  imageAlt,
  href,
  ctaLabel,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  image: string;
  imageAlt: string;
  href?: string;
  ctaLabel?: string;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <SplitText
            as="h2"
            text={title}
            className="text-3xl leading-[1.15] text-navy sm:text-4xl"
          />
          <p className="text-base leading-relaxed text-muted">{body}</p>
          {points && (
            <ul className="mt-1 grid gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm font-medium text-navy">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          {href && ctaLabel && (
            <ButtonLink href={href} variant="outline" className="mt-3">
              {ctaLabel}
            </ButtonLink>
          )}
        </div>
      </Reveal>

      <Reveal delay={120} className={reverse ? "lg:order-1" : ""}>
        <div className="relative">
          <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand/15 to-turquoise/15 blur-2xl" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] shadow-lift">
            {/* Cadre fermé : l'échelle couvre le débattement (±6 % → 1,12). */}
            <Parallax className="absolute inset-0" amount={6} scale={1.12}>
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </Parallax>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-light text-brand transition-colors hover:text-turquoise"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}