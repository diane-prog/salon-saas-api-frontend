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
 * L'apparition des tuiles a son propre mouvement (`.client-tile` dans `globals.css`) :
 * chacune part un peu plus bas, un peu plus petite et plus penchée, puis se redresse et se
 * pose. Le décalage entre deux tuiles suit leur HAUTEUR dans le champ et non leur rang dans
 * le tableau : l'ensemble descend donc comme une vague, du haut vers le bas — un ordre que
 * l'œil peut suivre, alors que les tuiles sont dispersées. Le mouvement ne touche que
 * `opacity`, `translate`, `scale` et `rotate`, des propriétés indépendantes : aucune n'en
 * écrase une autre, et l'inclinaison de repos reste une variable (`--tile-rotate`).
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
/**
 * Décalage de l'apparition d'une tuile, en millisecondes.
 *
 * `TILE_STAGGER` = millisecondes par pour cent de hauteur : une tuile posée à 85 % du champ
 * part donc bien après une tuile posée à 5 %. Les tuiles de droite sont en plus très
 * légèrement en retard (+ 45 ms) : la vague prend une pente, du haut-gauche vers le
 * bas-droit, au lieu d'être un simple balayage horizontal.
 */
const TILE_STAGGER = 5;

function tileDelay(spot: { top: string; right?: string }): number {
  return Math.round(60 + parseFloat(spot.top) * TILE_STAGGER + (spot.right ? 45 : 0));
}

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

/**
 * Arcs de liaison, dans le repère 1152 × 560 du champ.
 *
 * Ils vont du titre vers l'extérieur, par paires symétriques autour du centre (x = 576) :
 * à gauche celui qui part vers la bande du haut (1) répond à celui de droite (3), et sous le
 * titre celui du bas-gauche (5) répond à celui du bas-droit (4). Le cinquième est le MIRROIR
 * exact du quatrième — c'est ce qui manquait : le bas-gauche du champ était le seul coin
 * sans liaison, et un côté vide à cet endroit se voyait.
 */
const ARCS = [
  "M 214 208 C 262 232, 300 246, 372 262",
  "M 560 96 C 566 140, 566 168, 562 214",
  "M 772 236 C 848 220, 906 198, 962 172",
  "M 700 330 C 792 358, 852 396, 900 424",
  "M 452 330 C 360 358, 300 396, 252 424",
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
  const decor = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLUListElement>(null);

  /* Le calque décoratif — les arcs se dessinent, puis les points s'allument — quand le
     champ entre dans le champ de vision, avec le même déclencheur partagé que les textes
     (un seul écouteur pour tout le site).

     Le nom `client-arc-in` vient des arcs : c'est le signal qui existait déjà pour eux, et
     le même allume désormais les points. On le garde plutôt que d'en inventer un second —
     un seul état `in` pour le calque, et les CSS déjà servies (celles d'un serveur de dev
     lancé avant ces changements) continuent au moins de dessiner les arcs. */
  useEffect(() => {
    const layer = decor.current;
    if (!layer) return;
    return observeReveal(layer, () => layer.classList.add("client-arc-in"));
  }, []);

  /* Une tuile = une entrée : chacune se pose pour son compte, donc celles du bas du champ
     se posent quand on arrive sur elles — y compris sous `lg`, où le champ devient un long
     flux et où déclencher tout d'un coup ferait jouer la fin du mouvement hors écran. */
  useEffect(() => {
    const list = field.current;
    if (!list) return;
    const stops = Array.from(list.querySelectorAll<HTMLElement>(".client-tile")).map((tile) =>
      observeReveal(tile, () => tile.classList.add("client-tile-in")),
    );
    return () => stops.forEach((stop) => stop());
  }, []);

  return (
    <section className="relative overflow-hidden bg-beige/25 py-20">
      <div className="mx-auto w-full max-w-[80rem] px-5 sm:px-8">
        {/* Le champ : cadre de référence à partir de `lg` (mêmes proportions que le
            `viewBox` des arcs, donc le tracé tombe juste), flux simple en dessous. */}
        <div className="relative lg:aspect-[1152/560]">
          <ul ref={field} className="client-field">
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
                <li
                  key={client.src}
                  className="client-tile"
                  style={
                    {
                      left: spot.left,
                      right: spot.right,
                      top: spot.top,
                      "--tile-rotate": `${spot.rotate}deg`,
                      "--tile-delay": `${tileDelay(spot)}ms`,
                    } as React.CSSProperties
                  }
                >
                  {/* Tuile de papier nue : angles droits, un filet, aucun relief — la tuile
                      se pose sur la page, elle ne flotte pas au-dessus. */}
                  <div
                    title={client.name}
                    className="relative flex items-center justify-center bg-white px-4 py-3.5 ring-1 ring-navy/5"
                  >
                    <Image
                      src={client.src}
                      alt={client.name}
                      width={client.width}
                      height={client.height}
                      className={`object-contain ${spot.logo}`}
                    />
                    {tag ? (
                      <span className="client-tag absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-white">
                        {tag}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Arcs et points : seulement là où les tuiles tournent autour du texte. */}
          <div ref={decor} aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            <svg
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
                className={`client-dot absolute rounded-full ${dot.className}`}
                style={{ left: dot.left, right: dot.right, top: dot.top }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
