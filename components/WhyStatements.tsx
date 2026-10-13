"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Section « Pourquoi nous choisir » de l'accueil, d'après la maquette éditoriale :
 * une grille de huit tuiles, encadrées d'un filet fin — la première porte le sur-titre
 * et le titre de la section, les cinq suivantes sont les raisons numérotées (01 → 05 :
 * numéro en haut, titre et texte calés en bas), et deux photos s'insèrent dans le flux
 * (l'une en fin de première ligne, l'autre en tête de seconde).
 *
 * L'ordre du DOM suit la lecture : titre, 01, 02, photo, photo, 03, 04, 05 — en grille
 * de quatre colonnes cela donne exactement la disposition de la maquette, sans placement
 * explicite.
 *
 * Structure : `Reveal` (l'entrée au scroll) reste sur le `<li>`, l'habillage — filet,
 * proportions, effet de survol — sur une boîte interne, comme `glow-card` ailleurs sur
 * le site. C'est nécessaire ici : l'entrée GSAP écrit un `transform` sur le `<li>` et
 * écraserait le soulèvement du survol (GSAP rend la main à la fin, mais l'ordre des
 * couches reste plus simple à lire ainsi).
 *
 * Les deux photos glissent en parallaxe dans leur tuile.
 */

/**
 * Habillage commun aux huit tuiles : filet fin, fond beige très clair, proportions et
 * effet de survol.
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
  "why-tile group relative h-full aspect-[10/11] overflow-hidden border border-navy/10 bg-beige/35 hover:border-navy/25";

export default function WhyStatements() {
  const { dict } = useDictionary();
  const why = dict.aboutPage;
  /* Les deux premières cartes ferment la première ligne, les trois autres suivent les
     photos : la grille reproduit la maquette sans placer chaque tuile à la main. */
  const [first, second, ...rest] = why.whyCards;

  return (
    <section className="border-y border-navy/8 bg-white">
      <div className="mx-auto w-full max-w-[95rem] px-5 py-20 sm:px-8 sm:py-24">
        {/* Deux colonnes DÈS LE PLUS PETIT ÉCRAN : en une seule colonne, les huit tuiles
            de 10:11 s'étiraient sur près de 3 000 px de haut, avec les trois quarts de
            chaque tuile vides — c'est la section qui « s'affichait bizarrement » sur un
            téléphone. En deux colonnes, chaque tuile garde ses proportions et la section
            fait la moitié du chemin. La grille passe à quatre colonnes à partir de `lg`. */}
        <ol className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {/* Tuile d'en-tête : sur-titre discret en haut, titre en bas, comme la réf. */}
          <Reveal as="li" className="h-full">
            <div className="why-tile group relative flex h-full aspect-[10/11] flex-col justify-between gap-6 overflow-hidden border border-navy/10 bg-white p-4 hover:border-navy/25 sm:gap-10 sm:p-7">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-navy/55 sm:text-[0.68rem] sm:tracking-[0.24em]">
                {why.whyEyebrow}
              </p>
              <h2 className="max-w-[11ch] text-xl leading-[1.08] tracking-tight text-navy sm:text-4xl md:text-3xl lg:text-4xl">
                {why.whyHeadline}
              </h2>
            </div>
          </Reveal>

          <ReasonCard index={0} card={first} delay={60} />
          <ReasonCard index={1} card={second} delay={120} />

          <MediaTile src={why.whyImage} alt={why.whyImageAlt} delay={180} />

          {/* Photo recolorée en orange (duotone maison) : elle répond à la photo sombre
              de l'autre coin, comme dans la maquette. */}
          <MediaTile src={why.whyImage2} alt={why.whyImage2Alt} delay={240} duotone />

          {rest.map((card, i) => (
            <ReasonCard key={card.title} index={i + 2} card={card} delay={300 + i * 60} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Carte « raison » : numéro en haut, titre + texte calés sur le bas de la tuile. */
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
      <div className={`${TILE} flex flex-col justify-between gap-6 p-4 sm:gap-10 sm:p-7`}>
        <span className="text-sm font-medium tracking-[0.14em] text-navy/45 transition-colors duration-300 group-hover:text-navy/80 sm:text-base">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="text-base leading-snug text-navy sm:text-lg">{card.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
        </div>
      </div>
    </Reveal>
  );
}

/** Tuile photo : remplit la case de la grille, sans marge interne. */
function MediaTile({
  src,
  alt,
  delay,
  duotone = false,
}: {
  src: string;
  alt: string;
  delay: number;
  duotone?: boolean;
}) {
  return (
    <Reveal as="li" delay={delay} className="h-full">
      <div className={TILE}>
        {/* Cadre fermé (`aspect-[10/11]`) : c'est l'échelle qui couvre le débattement
            (±4 % → 1,09), la tuile garde exactement sa découpe. */}
        <Parallax className="absolute inset-0" amount={4} scale={1.09}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={duotone ? "object-cover grayscale" : "object-cover"}
          />
        </Parallax>
        {duotone ? (
          <span aria-hidden className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        ) : null}
      </div>
    </Reveal>
  );
}
