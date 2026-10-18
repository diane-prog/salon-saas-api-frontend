"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { useDictionary } from "@/components/DictionaryProvider";

/**
 * La grille « Pourquoi Belora » — la version SANS animation, pour les écrans étroits.
 *
 * POURQUOI UN COMPOSANT À PART, ET PAS UNE VARIANTE DE `ScrollStack` : sur téléphone,
 * l'ouverture au défilement n'a aucun sens — la grille tient sur une colonne, plus haute
 * que la fenêtre, et une scène épinglée n'y montrait qu'une fiche au milieu d'un écran
 * blanc, pendant 120 vh de défilement. Neutraliser l'effet en CSS laissait encore la
 * mécanique dans la page (hauteur de scène, épinglage, cartes masquées avant leur
 * révélation) : c'est précisément ce que le rendu étroit ne doit pas porter.
 *
 * Ici, il n'y a donc RIEN à neutraliser : pas de scène, pas d'épinglage, pas de variable
 * de pile, pas de révélation au défilement, pas de vidéo. Les quatre cases sont posées à
 * leur place définitive et visibles dès la première frame, avant même l'hydratation.
 *
 * Le contenu, lui, est le même : il vient du dictionnaire, comme le rendu large. Seule
 * l'illustration est passée en paramètre (`image`), pour qu'il n'y ait qu'une seule
 * lecture de la variable d'environnement — celle de `WhyStatements`, qui choisit entre
 * les deux rendus.
 *
 * Les deux rendus cohabitent dans le HTML et se remplacent au seuil `lg` (`lg:hidden`
 * ici, `hidden lg:block` sur la scène animée). Ils ne sont pas montés deux fois à
 * l'écran : le CSS en masque toujours un seul.
 */
const PLACEMENT = [
  "sm:col-start-1 sm:row-start-1",
  "sm:col-start-2 sm:row-start-1",
  "sm:col-start-2 sm:row-start-2",
];

export default function WhyGrid({
  image,
  className = "",
}: {
  /** L'illustration de la section (photo) — la vidéo n'est pas montée ici. */
  image: string;
  className?: string;
}) {
  const { dict, locale } = useDictionary();
  const { aboutPage: why, ui } = dict;

  return (
    <ol
      className={`grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_1.15fr] sm:gap-3 ${className}`}
    >
      {why.whyCards.map((card, index) => (
        <li key={card.title} className={PLACEMENT[index]}>
          <article className="flex h-full min-h-[12.5rem] flex-col border border-ink/12 p-5 sm:min-h-[16rem] sm:p-6">
            <span className="text-[0.62rem] font-medium tabular-nums tracking-[0.14em] text-ink/40">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-3 max-w-[24ch] text-[1.05rem] font-light leading-[1.25] text-ink">
              {card.title}
            </h3>

            <p className="mt-auto max-w-[34ch] pt-8 text-[0.8rem] leading-[1.6] text-ink/55">
              {card.body}
            </p>
          </article>
        </li>
      ))}

      {/* L'illustration ferme la grille en bas à droite, à la hauteur de `03`. */}
      <li
        className="min-h-[12.5rem] sm:col-start-3 sm:row-start-2 sm:min-h-[16rem]"
        style={{ zIndex: 10 } as CSSProperties}
      >
        <div className="relative h-full min-h-[12.5rem] overflow-hidden bg-ink sm:min-h-[16rem]">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element -- image fournie par l'exploitant (chemin local ou URL), hors liste blanche de `next/image`
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Le grain dans son propre cadre : `grain` pose `position: relative`. */}
          <div className="absolute inset-0">
            <div className="grain h-full w-full" />
          </div>

          <Link
            href={`/${locale}/register`}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-turquoise px-4 py-2.5 text-[0.56rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-paper"
          >
            {ui.freeQuote}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </li>
    </ol>
  );
}
