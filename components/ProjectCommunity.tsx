"use client";

import Image from "next/image";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations : mur « communauté », copie au plus près de la référence fournie.
 *
 * Observations prises sur l'image, une par une :
 * - Titre NU posé sur le fond (aucun panneau) : 1re ligne claire, 2e atténuée.
 * - Filets fins : une ligne horizontale sous l'en-tête, deux verticales qui encadrent
 *   la zone centrale ; les colonnes de cartes défilent AU-DELÀ de ces lignes.
 * - Une seule fois chaque citation par rangée (aucun doublon visible à l'écran).
 * - Cartes citation : verre gris translucide LÉGER qui se floute sur ce qui passe
 *   derrière, texte court borné dans la carte, nom en une ligne, étoile à droite.
 * - Cartes média : nom du client, petit compteur « N réalisations · type », play
 *   central rond sur les verticales (`big`) + play discrète en bas à droite partout.
 * - Défilement horizontal continu, pause au survol, léger zoom de carte.
 *
 * Nos cartes sont des images (pas de vidéo) : le play est décoratif, la carte mène à
 * /realisations. Les compteurs sont des gabarits à remplacer par de vraies données.
 */

/** Largeur d'une colonne (21rem) en px, pour la durée de boucle. */
const COL_PITCH = 21 * 16;
const SPEED = 24; // px/s

type Card =
  | { kind: "project"; index: number; height: string; big?: boolean }
  | { kind: "quote"; index: number; height: string }
  | { kind: "video"; index: number; height: string };

/*
 * UNE SEULE rangée de marquee (droite → gauche), comme demandé.
 *
 * DENSITÉ comme la référence : chaque colonne REMPLIT la hauteur du mur — deux à
 * trois cartes empilées de hauteurs complémentaires (hauteurs + gouttières = 34rem),
 * aucune colonne ne flotte avec du vide en dessous. Six schémas de colonne, chaque
 * carte n'apparaît qu'une fois par période ; la copie de boucle (x2) est technique
 * (rebouclage sans trou) et jamais à l'écran en même temps que son original.
 */
const ROW: Card[][] = [
  [{ kind: "quote", index: 0, height: "12rem" }, { kind: "project", index: 0, height: "21rem" }],
  [{ kind: "project", index: 1, height: "20rem" }, { kind: "video", index: 1, height: "13rem" }],
  [{ kind: "quote", index: 1, height: "10rem" }, { kind: "project", index: 2, height: "23rem" }],
  [{ kind: "video", index: 2, height: "16rem" }, { kind: "project", index: 3, height: "17rem" }],
  [{ kind: "quote", index: 2, height: "11rem" }, { kind: "project", index: 4, height: "22rem" }],
  [
    { kind: "video", index: 3, height: "12rem" },
    { kind: "quote", index: 3, height: "9rem" },
    { kind: "project", index: 5, height: "11rem" },
  ],
];

/** Décalage vertical d'attaque de chaque colonne (stagger organique de la réf.). */
const OFFSETS = ["0rem", "1.5rem", "0.5rem", "0rem", "1.25rem", "2rem"];

/** Carte média : visuel + légende façon créateur, double play comme la référence. */
function MediaCard({ card }: { card: Extract<Card, { kind: "project" }> }) {
  const { dict, locale } = useDictionary();
  const project = dict.projects[card.index % dict.projects.length];
  const client = dict.clients[card.index % dict.clients.length];
  const count = 2 + (card.index % 4); // Gabarit : à remplacer par les vraies données.

  return (
    <a
      href={`/${locale}/realisations`}
      className="group relative block h-full w-full overflow-hidden rounded-[0.9rem] shadow-lift transition-transform duration-300 ease-out group-hover:scale-[1.03]"
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 60vw, 21rem"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"
      />

      {/* Gros play central — la référence l'affiche sur quasi toutes les cartes média. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-black/50"
      >
        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>

      <span
        aria-hidden
        className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-md bg-white/25 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/45"
      >
        <svg viewBox="0 0 24 24" className="ml-0.5 h-3 w-3" fill="currentColor">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>

      <div className="absolute inset-x-4 bottom-3 pr-11">
        <p className="truncate text-[0.95rem] font-medium text-white">{client}</p>
        <p className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/70">
          {count} réalisations · {project.category}
        </p>
      </div>
    </a>
  );
}

/**
 * Carte citation : verre LÉGER — le fond ne fait que teinter ce qui passe derrière,
 * le texte est court et borné (aucun débordement), étoile en bas à droite.
 */
function QuoteCardView({ card }: { card: Extract<Card, { kind: "quote" }> }) {
  const { dict } = useDictionary();
  const quote = dict.testimonials[card.index % dict.testimonials.length];

  return (
    <figure className="flex h-full w-full flex-col justify-between overflow-hidden rounded-[0.9rem] border border-white/20 bg-navy/30 p-5 backdrop-blur-md transition-transform duration-300 ease-out group-hover:scale-[1.03]">
      <blockquote className="line-clamp-3 text-[0.9rem] leading-snug text-white/90">
        “{quote.quote}”
      </blockquote>
      <div className="mt-3 flex items-end justify-between gap-3">
        <figcaption className="min-w-0">
          <span className="block truncate text-[0.8rem] font-medium text-white">
            {quote.name}
          </span>
          <span className="mt-0.5 block truncate text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/55">
            {quote.company}
          </span>
        </figcaption>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 fill-white/80"
          aria-hidden
        >
          <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
        </svg>
      </div>
    </figure>
  );
}

/**
 * Carte témoignage filme (la référence montre des créateurs qui parlent) : portrait,
 * gros play central, nom + entreprise en bas comme sur une carte vidéo de créateur.
 */
function PortraitCard({ card }: { card: Extract<Card, { kind: "video" }> }) {
  const { dict, locale } = useDictionary();
  const quote = dict.testimonials[card.index % dict.testimonials.length];

  return (
    <a
      href={`/${locale}/realisations`}
      className="group relative block h-full w-full overflow-hidden rounded-[0.9rem] shadow-lift transition-transform duration-300 ease-out group-hover:scale-[1.03]"
    >
      <Image
        src={quote.image}
        alt={quote.name}
        fill
        sizes="(max-width: 768px) 60vw, 21rem"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10"
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-black/50"
      >
        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>
      <div className="absolute inset-x-4 bottom-3">
        <p className="truncate text-[0.95rem] font-medium text-white">{quote.name}</p>
        <p className="mt-0.5 truncate text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/70">
          {quote.company}
        </p>
      </div>
    </a>
  );
}

/** Une colonne = une pile qui remplit la hauteur du mur, attaquée avec un léger décalage. */
function Column({ cards, offset = "0rem" }: { cards: Card[]; offset?: string }) {
  return (
    <div style={{ marginTop: offset }} className="flex w-[21rem] shrink-0 flex-col gap-4">
      {cards.map((card, i) => (
        <div
          key={`${card.kind}-${card.index}-${i}`}
          style={{ height: card.height }}
          className="group"
        >
          {card.kind === "project" ? (
            <MediaCard card={card} />
          ) : card.kind === "video" ? (
            <PortraitCard card={card} />
          ) : (
            <QuoteCardView card={card} />
          )}
        </div>
      ))}
    </div>
  );
}

/** Une bande : les colonnes dupliquées pour une boucle fermée (-50 %). */
function Track({ columns, direction, desync }: {
  columns: Card[][];
  direction: 1 | -1;
  desync: string;
}) {
  const loop = [...columns, ...columns];
  const duration = Math.round((columns.length * COL_PITCH) / SPEED);

  return (
    <div className="community-row overflow-hidden">
      <div
        className="community-track flex w-max items-start gap-4 pr-4"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: direction === 1 ? "reverse" : "normal",
            animationDelay: desync,
          } as React.CSSProperties
        }
      >
        {loop.map((cards, i) => (
          <Column
            key={`col-${i}`}
            cards={cards}
            offset={OFFSETS[i % OFFSETS.length] ?? "0rem"}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectCommunity() {
  const { dict } = useDictionary();
  const words = dict.ui.projectsHeading.split(/\s+/).filter(Boolean);
  const splitAt = Math.max(2, Math.ceil(words.length / 2));

  return (
    <section
      className="relative overflow-hidden pt-10 sm:pt-12"
      style={
        {
          background:
            "linear-gradient(160deg, #c9d8e3 0%, #dfe8ef 45%, #d3dfe8 100%)",
        } as React.CSSProperties
      }
    >
      {/* Bande grise derrière l'en-tête, comme la zone plus grise du haut de la réf. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#9db2c0]/45 to-transparent"
      />

      {/* En-tête : titre NU sur deux lignes, 1re claire / 2e atténuée, comme la réf. */}
      <div className="relative mx-auto max-w-[58rem] px-6">
        <h2 className="text-4xl leading-[1.14] text-white [text-shadow:0_1px_14px_rgb(15_23_42_/_0.18)] sm:text-5xl">
          <span className="block">{words.slice(0, splitAt).join(" ")}</span>
          <span className="block text-white/50 [text-shadow:none]">
            {words.slice(splitAt).join(" ")}
          </span>
        </h2>
      </div>

      {/* Filet horizontal sous l'en-tête, sur toute la largeur. */}
      <div aria-hidden className="mt-8 h-px w-full bg-white/45" />

      {/* Filets verticaux : ils bornent la zone centrale, les cartes passent au-delà. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 top-[10.5rem] left-[calc(50%-29rem)] hidden w-px bg-white/40 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 top-[10.5rem] right-[calc(50%-29rem)] hidden w-px bg-white/40 lg:block"
      />

      {/* Mur défilant : UNE seule rangée droite → gauche, fondus latéraux clairs. */}
      <div className="community-fades relative mt-6 pb-16 sm:pb-20">
        <Track columns={ROW} direction={-1} desync="0s" />
      </div>
    </section>
  );
}
