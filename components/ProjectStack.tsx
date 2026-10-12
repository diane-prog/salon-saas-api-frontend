"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations : une galerie en colonnes décalées, façon masonry editorial.
 *
 * Chaque projet est une carte de hauteur variable — la hauteur est fixée dans
 * `HEIGHTS` plutôt que laissée à `aspect-ratio`, c'est ce qui produit l'irrégularité
 * de la référence. Les colonnes montent en décalé : chaque bloc est poussé vers le
 * bas d'une hauteur croissante, d'où l'effet de Cascade.
 *
 * Les citations de clients sont mêlées aux projets : elles occupent une carte de la
 * grille, ce qui casse la régularité des images et donne le rythme de la maquette.
 */

/** Hauteurs des cartes de projet, en multiples de 30rem, dans l'ordre du flux. */
const HEIGHTS = [1.15, 0.78, 0.95, 1.28, 0.85, 1.05, 0.72, 1.2];

/** Poussée verticale de chaque bloc, en rem : c'est le décalage en cascade. */
const DROP_CLASSES = ["", "mt-12", "mt-6", "mt-20", "mt-10", "mt-16", "mt-4"];

export default function ProjectStack() {
  const { dict, locale } = useDictionary();
  const { projects, testimonials, ui } = dict;

  /* On alterne projet et citation pour obtenir une grille irrégulière. */
  const items: ({ kind: "project" | "quote"; index: number })[] = [];
  projects.forEach((_, index) => {
    items.push({ kind: "project", index });
    if (index === 2 || index === 4) items.push({ kind: "quote", index: index - 2 });
  });

  return (
    <div className="container-x">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {items.map((item, position) => {
          const drop = DROP_CLASSES[position % DROP_CLASSES.length];

          if (item.kind === "quote") {
            const quote = testimonials[item.index % testimonials.length];
            return (
              <Reveal
                key={`quote-${position}`}
                delay={position * 50}
                className={`flex ${drop}`}
              >
                <figure className="flex h-full w-full flex-col justify-end rounded-2xl bg-navy p-6 shadow-soft">
                  <blockquote className="text-base leading-relaxed text-white/85">
                    “{quote.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-white/50">
                    {quote.name} — {quote.company}
                  </figcaption>
                </figure>
              </Reveal>
            );
          }

          const project = projects[item.index];
          const height = HEIGHTS[item.index % HEIGHTS.length];

          return (
            <Reveal
              key={project.title}
              delay={position * 50}
              className={`flex ${drop}`}
            >
              <Link
                href={`/${locale}/realisations`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-navy shadow-soft"
                style={{ height: `calc(${height} * 30rem)` }}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/15 to-transparent"
                />

                {/* Bouton play, comme sur la maquette. */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy/45 text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors duration-300 group-hover:bg-navy/70"
                >
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>

                <div className="absolute inset-x-5 bottom-5">
                  <h3 className="text-lg font-semibold leading-snug text-white">{project.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/60">
                    {project.category}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-12 text-center text-sm text-muted">{ui.viewAllProjects}</p>
    </div>
  );
}