"use client";

import Image from "next/image";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations en cartes empilées « overlapping ».
 *
 * Chaque carte est un grand visuel qui se chevauche avec la précédente (marge négative :
 * la carte suivante passe par-dessus le bas de l'ancienne, coins arrondis qui s'emboîtent)
 * et se décale alternativement d'un côté puis de l'autre. La catégorie se pose en pastille
 * de verre, le titre et le résumé en bas à gauche sur un voile navy.
 *
 * Le décalage et le chevauchement n'existent qu'à partir de `lg` : sur mobile les cartes
 * s'enchaînent simplement, pleine largeur.
 */
export default function ProjectStack() {
  const { dict } = useDictionary();
  const { projects } = dict;
  const count = projects.length;

  return (
    <ul className="mx-auto flex max-w-[64rem] flex-col gap-6 sm:gap-8 lg:gap-0">
      {projects.map((project, index) => (
        <Reveal
          as="li"
          key={`${project.title}-${index}`}
          delay={index * 60}
          className={`relative ${index > 0 ? "lg:-mt-8" : ""}`}
        >
          <article
            className={`group relative h-[clamp(16rem,46vh,26rem)] overflow-hidden rounded-[1.5rem] bg-navy shadow-lift ${
              index % 2 === 0 ? "lg:ml-[7%]" : "lg:mr-[7%]"
            }`}
          >
            <Parallax className="absolute inset-0" amount={5} scale={1.12}>
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 72vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </Parallax>

            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-navy/5"
            />

            <span className="absolute left-5 top-5 text-[0.68rem] font-medium tabular-nums tracking-[0.22em] text-white/60 sm:left-7 sm:top-7">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>

            <span className="absolute right-5 top-5 rounded-full bg-white/10 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur sm:right-7 sm:top-7">
              {project.category}
            </span>

            {/* Le texte remonte à `lg` : la carte suivante recouvre le bas de celle-ci. */}
            <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7 lg:bottom-14">
              <span aria-hidden className="mb-4 block h-px w-8 bg-white/50" />
              <h3 className="max-w-lg text-lg font-semibold leading-snug text-white sm:text-xl">
                {project.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{project.body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
