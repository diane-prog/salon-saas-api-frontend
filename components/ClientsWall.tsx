"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import { clientLogos } from "@/lib/clients";
import { observeReveal } from "@/lib/reveal";

/**
 * Références clients (accueil) : un champ de tuiles flottantes autour du titre.
 *
 * Le titre occupe le centre ; les douze logos clients sont posés autour, à des hauteurs
 * différentes, chacun avec sa propre inclinaison, comme des vignettes posées sur la page.
 * Quelques tuiles portent une pastille qui dit ce que nous avons fait pour ce client, et
 * de fins arcs relient une tuile au texte — le tracé se dessine à l'entrée dans le champ.
 *
 * Sous `lg`, il n'y a pas la place de faire tourner un champ autour du texte : la même
 * liste devient un simple flux de cartes centrées, sous le titre. Ce sont les positions en
 * pourcentage (`LEFT` / `TOP` / `ROTATE`) qui ne s'appliquent qu'à partir de `lg` — le
 * composant pose les valeurs, `globals.css` ne fait que la mécanique (`.client-field`).
 *
 * L'inclinaison passe par la propriété CSS `rotate` et non par `transform` : elle cohabite
 * ainsi avec la révélation (qui, elle, écrit `transform`) sans que l'une écrase l'autre.
 */

/**
 * Une entrée par tuile : où elle se pose (en % du champ) et comment elle penche.
 *
 * `logo` est une BOÎTE (largeur et hauteur fixes, `object-contain` dessus) et non une
 * hauteur : les logotypes livrés vont du bandeau très large (256 × 105) au carré (196 ×
 * 196), et les caler sur une même hauteur donnerait des cartes de 65 px pour les uns et
 * de 100 px pour les autres, avec un logo minuscule dedans. Dans une boîte, chacun occupe
 * la même place optique et les cartes restent de tailles voisines.
 */
const PLACEMENT: { left?: string; right?: string; top: string; rotate: number; logo: string }[] = [
  { left: "12%", top: "2%", rotate: -6, logo: "h-9 w-[4.75rem]" },
  { left: "41%", top: "7%", rotate: 4, logo: "h-9 w-[4.75rem]" },
  { right: "11%", top: "2%", rotate: 7, logo: "h-11 w-24" },
  { left: "1%", top: "27%", rotate: -3, logo: "h-11 w-24" },
  { left: "3%", top: "51%", rotate: 5, logo: "h-8 w-16" },
  { left: "0%", top: "73%", rotate: -5, logo: "h-9 w-[4.75rem]" },
  { right: "3%", top: "24%", rotate: 3, logo: "h-9 w-[4.75rem]" },
  { right: "0%", top: "49%", rotate: -4, logo: "h-8 w-16" },
  { right: "5%", top: "72%", rotate: 8, logo: "h-11 w-24" },
  { left: "22%", top: "85%", rotate: -2, logo: "h-9 w-[4.75rem]" },
  { left: "48%", top: "89%", rotate: 5, logo: "h-9 w-[4.75rem]" },
  { right: "20%", top: "84%", rotate: -6, logo: "h-9 w-[4.75rem]" },
];

/** Pastilles de contexte : ce que nous avons fait pour ce client (d'après nos réalisations). */
const TAGS: Record<string, string> = {
  comprint: "Campagne Ads",
  emf: "Site web",
  setna: "Branding",
  etincelles: "Contenu social",
  "elu-annee": "Événementiel",
};

/** Petits points colorés du champ, comme sur la référence (purement décoratifs). */
const DOTS = [
  { left: "30%", top: "12%", className: "h-2.5 w-2.5 bg-orange" },
  { right: "30%", top: "14%", className: "h-2 w-2 bg-turquoise" },
  { left: "8%", top: "88%", className: "h-2 w-2 bg-brand" },
];

/** Arcs de liaison, dans le repère 1152 × 560 du champ. */
const ARCS = [
  "M 214 208 C 262 232, 300 246, 372 262",
  "M 560 96 C 566 140, 566 168, 562 214",
  "M 772 236 C 848 220, 906 198, 962 172",
  "M 700 330 C 792 358, 852 396, 900 424",
];

export default function ClientsWall({
  eyebrow,
  title,
  linkHref,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  linkHref: string;
  linkLabel: string;
}) {
  const arcs = useRef<SVGSVGElement>(null);

  /* Les arcs se dessinent quand le champ entre dans le champ de vision, avec le même
     déclencheur partagé que les textes (un seul écouteur pour tout le site). */
  useEffect(() => {
    const svg = arcs.current;
    if (!svg) return;
    return observeReveal(svg, () => svg.classList.add("client-arc-in"));
  }, []);

  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto w-full max-w-[80rem] px-5 sm:px-8">
        {/* Le champ : cadre de référence à partir de `lg` (mêmes proportions que le
            `viewBox` des arcs, donc le tracé tombe juste), flux simple en dessous. */}
        <div className="relative lg:aspect-[1152/560]">
          <ul className="client-field">
            {/* Le titre est un élément du champ : au centre sur grand écran, en tête sur
                mobile. Pas de `Reveal` sur la boîte positionnée elle-même — la règle de
                révélation écrit `transform`, ce qui annulerait le centrage par translation. */}
            <li className="order-first w-full lg:absolute lg:left-1/2 lg:top-[42%] lg:z-10 lg:w-[54%] lg:-translate-x-1/2 lg:-translate-y-1/2">
              <Reveal className="flex flex-col items-center gap-4 text-center">
                <Eyebrow>{eyebrow}</Eyebrow>
                <h2 className="max-w-[18ch] text-3xl leading-[1.1] text-navy sm:text-4xl lg:text-5xl">
                  {title}
                </h2>
                <Link
                  href={linkHref}
                  className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
                >
                  {linkLabel}
                </Link>
              </Reveal>
            </li>

            {clientLogos.map((client, i) => {
              const spot = PLACEMENT[i % PLACEMENT.length];
              const tag = TAGS[client.src.split("/").pop()?.replace(".png", "") ?? ""];

              return (
                <Reveal
                  as="li"
                  key={client.src}
                  delay={80 + i * 55}
                  className="client-tile"
                  style={{
                    left: spot.left,
                    right: spot.right,
                    top: spot.top,
                    rotate: `${spot.rotate}deg`,
                  }}
                >
                  <div
                    title={client.name}
                    className="relative flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 shadow-soft ring-1 ring-navy/5 lg:shadow-lift"
                  >
                    <Image
                      src={client.src}
                      alt={client.name}
                      width={client.width}
                      height={client.height}
                      className={`object-contain ${spot.logo}`}
                    />
                    {tag ? (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-white">
                        {tag}
                      </span>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {/* Arcs et points : seulement là où les tuiles tournent autour du texte. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            <svg
              ref={arcs}
              viewBox="0 0 1152 560"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full text-navy/15"
            >
              {ARCS.map((d) => (
                <path
                  key={d}
                  d={d}
                  className="client-arc"
                  style={{ "--arc-length": 700 } as React.CSSProperties}
                  stroke="currentColor"
                  strokeWidth={1.25}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            {DOTS.map((dot) => (
              <span
                key={`${dot.left ?? dot.right}-${dot.top}`}
                className={`absolute rounded-full ${dot.className}`}
                style={{ left: dot.left, right: dot.right, top: dot.top }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
