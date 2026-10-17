"use client";

import Reveal from "@/components/Reveal";
import { ProductPanel } from "@/components/ProductPanel";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Section « Pourquoi nous choisir » de l'accueil.
 *
 * UNE seule liste de raisons, DEUX mises en page — les mêmes textes, lus de la façon qui
 * convient à l'écran :
 *
 * - GRAND ÉCRAN (≥ lg) : la grille éditoriale de huit tuiles encadrées d'un filet fin. La
 *   première porte le sur-titre et le titre de la section, les cinq suivantes sont les
 *   raisons numérotées (01 → 05 : numéro en haut, titre et texte calés en bas), et deux
 *   photos s'insèrent dans le flux (l'une en fin de première ligne, l'autre en tête de
 *   seconde). L'ordre du DOM suit la lecture : titre, 01, 02, photo, photo, 03, 04, 05 —
 *   en grille de quatre colonnes cela donne exactement la disposition de la maquette, sans
 *   placement explicite.
 *
 * - TÉLÉPHONE ET TABLETTE : un SOMMAIRE, sur le modèle de la vue liste des réalisations —
 *   une ligne par raison, un filet entre elles, numéro à gauche, titre et texte à droite.
 *   En tuiles de 10:11 empilées, la section faisait près de trois mille pixels de haut avec
 *   les trois quarts de chaque tuile vides ; c'est ce qui s'affichait bizarrement sur un
 *   téléphone. Une ligne de sommaire dit la même chose en un quart de la hauteur.
 *
 *   Une SEULE photo y est conservée : celle qui ferme la première ligne sur grand écran
 *   (la deuxième, recolorée en orange, ne sert qu'à équilibrer la grille — sur un sommaire
 *   elle n'aurait plus rien à équilibrer et couperait la liste en deux). Elle est
 *   volontairement en 4:3 et non en 10:11 : en bandeau, elle respire entre deux raisons.
 *
 * Structure : `Reveal` (l'entrée au scroll) reste sur le `<li>`, l'habillage — filet,
 * proportions, effet de survol — sur une boîte interne, comme `glow-card` ailleurs sur le
 * site. C'est nécessaire ici : l'entrée GSAP écrit un `transform` sur le `<li>` et
 * écraserait le soulèvement du survol (GSAP rend la main à la fin, mais l'ordre des
 * couches reste plus simple à lire ainsi).
 *
 * Les deux photos glissent en parallaxe dans leur tuile.
 */

/**
 * Habillage commun aux tuiles : filet, fond beige très clair, proportions et effet de
 * survol sur grand écran ; sur téléphone, un simple filet BAS, qui fait la ligne de
 * sommaire. Les deux vivent dans la même chaîne : la bascule se fait à `lg`, il n'y a donc
 * jamais deux éléments à garder d'accord.
 *
 * Le rapport 10:11 (un peu plus haut que large) est celui de la maquette : des carrés
 * légèrement verticaux à toutes les largeurs, jamais des bandes. `h-full` égalise les
 * tuiles d'une même ligne ; `why-tile` (globals.css) n'ajoute que l'effet de survol.
 *
 * `relative` et `overflow-hidden` sont écrits ICI, et pas seulement dans l'utilitaire :
 * la photo en `fill` a besoin d'un parent positionné, et sans lui elle se cale sur
 * l'ancêtre positionné le plus proche — c'est-à-dire la page (l'image remontait sur le
 * hero) tandis que la tuile restait vide. Une CSS servie en retard (dev) ne doit pas
 * pouvoir casser la mise en page, seulement l'effet.
 */
const TILE =
  "why-tile group relative h-full border-b border-navy/10 lg:aspect-[10/11] lg:overflow-hidden lg:border lg:border-navy/10 lg:bg-beige/35 lg:hover:border-navy/25";
const TILE_INNER =
  "flex h-full gap-4 py-5 lg:flex-col lg:justify-between lg:gap-10 lg:p-7";

export default function WhyStatements() {
  const { dict } = useDictionary();
  const why = dict.aboutPage;
  /* Les deux premières raisons ferment la première ligne du grand écran, les trois autres
     suivent les photos : la grille reproduit la maquette sans placer chaque tuile à la main. */
  const [first, second, ...rest] = why.whyCards;

  return (
    <section className="border-y border-navy/8 bg-white">
      <div className="mx-auto w-full max-w-[95rem] px-5 py-20 sm:px-8 sm:py-24">
        {/* Aucune gouttière sur téléphone : les lignes du sommaire se touchent, séparées par
            leur filet — c'est la mise en page de la vue liste des réalisations. La grille
            ne prend ses quatre colonnes qu'à partir de `lg`. */}
        <ol className="grid grid-cols-1 gap-0 lg:grid-cols-4 lg:gap-3">
          {/* Tuile d'en-tête : sur-titre discret en haut, titre en bas, comme la réf. Sur
              téléphone, elle ouvre le sommaire sans cadre — c'est le titre de la section,
              pas une ligne de plus. */}
          <Reveal as="li" className="h-full">
            <div className="why-tile group relative flex h-full flex-col justify-between gap-4 border-b border-navy/10 pb-7 lg:aspect-[10/11] lg:gap-10 lg:overflow-hidden lg:border lg:border-navy/10 lg:bg-white lg:p-7 lg:hover:border-navy/25">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-navy/55 sm:text-[0.68rem] sm:tracking-[0.24em]">
                {why.whyEyebrow}
              </p>
              <h2 className="max-w-[13ch] text-2xl leading-[1.08] tracking-tight text-navy sm:text-3xl lg:max-w-[11ch] lg:text-4xl">
                {why.whyHeadline}
              </h2>
            </div>
          </Reveal>

          <ReasonCard index={0} card={first} delay={60} />
          <ReasonCard index={1} card={second} delay={120} />

          {/* Deux panneaux produit à la place des photographies : l'agenda du jour et le
              parcours de réservation. C'est le produit qui illustre le propos, pas un
              portrait d'équipe — et rien à télécharger. */}
          <MediaTile delay={180}>
            <ProductPanel variant="agenda" />
          </MediaTile>

          <MediaTile delay={240} desktopOnly>
            <ProductPanel variant="booking" />
          </MediaTile>

          {rest.map((card, i) => (
            <ReasonCard key={card.title} index={i + 2} card={card} delay={300 + i * 60} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Une raison : numéro à gauche sur téléphone (haut de la tuile sur grand écran), titre et texte. */
function ReasonCard({
  index,
  card,
  delay,
}: {
  index: number;
  card: { title: string; body: string };
  delay: number;
}) {
  return (
    <Reveal as="li" delay={delay} className="h-full">
      <div className={`${TILE} ${TILE_INNER}`}>
        <span className="w-6 shrink-0 text-[0.7rem] font-medium tracking-[0.14em] text-navy/45 tabular-nums transition-colors duration-300 group-hover:text-navy/80 lg:w-auto lg:text-base">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="text-base leading-snug text-navy lg:text-lg">{card.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted lg:mt-2">{card.body}</p>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * Tuile illustration : remplit la case de la grille sur grand écran ; sur téléphone, un
 * bandeau entre deux raisons, avec l'air qu'un bandeau demande. Ce n'est plus une photo
 * mais un panneau produit dessiné (`ProductPanel`), posé sur le papier avec un filet.
 */
function MediaTile({
  children,
  delay,
  desktopOnly = false,
}: {
  children: React.ReactNode;
  delay: number;
  /** Panneau qui n'existe qu'à partir de `lg` (équilibre de la grille). */
  desktopOnly?: boolean;
}) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className={`h-full border-b border-navy/10 py-5 lg:border-0 lg:py-0 ${
        desktopOnly ? "hidden lg:block" : ""
      }`}
    >
      <div className="flex h-full items-center justify-center border border-navy/10 bg-white p-4 lg:aspect-[10/11] lg:p-6">
        <div className="w-full">{children}</div>
      </div>
    </Reveal>
  );
}
