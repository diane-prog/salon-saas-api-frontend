"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL, ROW, RULE } from "@/lib/editorial";

/**
 * Index des services : une table éditoriale, une ligne par service.
 *
 * Numéro, titre, phrase, flèche — le tout séparé par des filets, sans carte, sans ombre,
 * sans pastille. Au survol, la ligne s'éclaire (le titre glisse d'un cran) et une vignette
 * de l'image du service SUIT LE CURSEUR : c'est la seule animation de la section, et elle
 * remplace les six cartes à icônes qui précédaient.
 *
 * L'aperçu est écrit directement dans le `style` de la vignette via une `ref`, jamais dans
 * l'état React : suivre la souris ne doit pas re-rendre six lignes à chaque pixel. Il est
 * monté en `fixed` et centré sur le curseur par un `translate(-50%, -50%)` interne, et il
 * reste `aria-hidden` — c'est une décoration, l'information est déjà dans la ligne.
 *
 * Sous `lg`, pas d'aperçu (pas de curseur à suivre) : les lignes suffisent.
 */
export default function ServicesTable() {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;
  const [hovered, setHovered] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const active = hovered ? services.find((s) => s.slug === hovered) : undefined;

  const follow = (event: React.MouseEvent<HTMLUListElement>) => {
    const node = preview.current;
    if (!node) return;
    node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  };

  return (
    <>
      <ul
        className={`border-t ${RULE}`}
        onMouseMove={follow}
        onMouseLeave={() => setHovered(null)}
      >
        {services.map((service, i) => (
          <li key={service.slug} className={`border-b ${RULE}`}>
            <Link
              href={`/${locale}/services/${service.slug}`}
              onMouseEnter={() => setHovered(service.slug)}
              onFocus={() => setHovered(null)}
              className="group grid items-baseline gap-x-8 gap-y-2 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] lg:grid-cols-[3rem_minmax(0,0.9fr)_minmax(0,1.1fr)_2rem]"
            >
              <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
              <span className={`${ROW} transition-transform duration-500 group-hover:translate-x-1`}>
                {service.title}
              </span>
              <span className={`${BODY} text-ink/60`}>{service.short}</span>
              <span className="hidden justify-self-end lg:block">
                <ArrowRight className="h-4 w-4 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className={`mt-6 ${LABEL} text-ink/35`}>{ui.viewAllServices}</p>

      {/* Aperçu qui suit le curseur. */}
      <div
        ref={preview}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-40 hidden transition-opacity duration-300 lg:block ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        {active ? (
          <div className="relative h-40 w-60 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-ink/[0.06]">
            <Image src={active.image} alt="" fill sizes="240px" className="object-cover" />
          </div>
        ) : null}
      </div>
    </>
  );
}
