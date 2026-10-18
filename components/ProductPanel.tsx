"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Panneaux produit dessinés — l'illustration du site, sans photo.
 *
 * POURQUOI CE FICHIER : les pages de service et la section « pourquoi » montraient des
 * photographies de projets d'agence (et deux portraits d'équipe). Ce n'est pas le produit,
 * et une photo de stock dit exactement l'inverse de ce qu'on vend : un logiciel de salon.
 *
 * Ici, l'illustration est le produit lui-même, réduit à sa structure : des heures, des
 * noms, des prix, des états. Tout est en HTML et en CSS, donc net à toutes les tailles,
 * lisible sans JavaScript, et sans un seul pixel à télécharger. Ce n'est pas une capture
 * d'écran — c'est un dessin assumé —, mais chaque ligne respecte les règles du vrai
 * écran : heure en chiffres tabulaires, statut en petites capitales, prix aligné à droite.
 *
 * LE PANEL VIT, MAINTENANT (ce qui a changé) : une capture d'écran est morte, et c'est
 * justement ce qui la trahit. Le panneau se comporte donc comme un écran allumé —
 *   · toutes les 3,2 s, UNE ligne change de valeur (statut, chargement, étiquette, créneau,
 *     KPI). Mais ce n'est plus le TEXTE seul qui bouge : la ligne entière se relève sous
 *     son masque (la nouvelle valeur monte du bas du cadre, elle n'apparaît pas en fondu),
 *     et le repère de laiton se déplace d'une ligne à l'autre en se déployant — la ligne
 *     active s'éclaire et s'indente de 3 px pendant que la précédente s'éteint. Le regard
 *     suit un mouvement de ligne, pas un clignotement de caractères ;
 *   · toutes les ~19 s (une fois sur six), la LISTE ENTIÈRE se rafraîchit : toutes les
 *     lignes remontent sous leur masque en cascade (55 ms d'écart), comme un tableau de
 *     départs qui se réaffiche, et la carte imprime un très léger basculement (1,1°) ;
 *   · en continu, un reflet traverse la carte de haut en bas (7 s), et les barres du
 *     pilotage respirent. C'est ce qui distingue un écran allumé d'une image posée —
 *     même quand aucune donnée ne change, quelque chose vit.
 *
 * LE HASARD EST DÉTERMINISTE. La valeur d'une frame se calcule à partir du numéro de
 * battement (`chance(seed)`), jamais de `Math.random()` au rendu : le serveur et le client
 * peignent donc exactement le même panneau au premier rendu, sans erreur d'hydratation.
 * Le battement 0 est toujours le contenu d'origine — le dessin ne saute pas au chargement.
 *
 * ET RIEN NE BOUGE SI ON L'A DEMANDÉ : `prefers-reduced-motion` coupe le minuteur ET les
 * animations (les keyframes sont désactivées en CSS). Le panneau reste alors une image
 * fixe, complète.
 *
 * Rien n'est interactif et l'ensemble est `aria-hidden` : l'information utile est dans le
 * texte de la page, le panneau n'est qu'un appui visuel. Il est posé sur une carte de
 * papier, avec un seul filet et un accent laiton — la même matière que le reste du site.
 */

type Variant = "agenda" | "booking" | "clients" | "catalogue" | "team" | "numbers";

const LABELS: Record<Variant, { title: string; caption: string }> = {
  agenda: { title: "Mardi 14 · Aujourd'hui", caption: "Vue du jour" },
  booking: { title: "Réserver · 21 h 47", caption: "Vitrine publique" },
  clients: { title: "Clientèle", caption: "Fiche cliente" },
  catalogue: { title: "Prestations", caption: "Catalogue en ligne" },
  team: { title: "Équipe", caption: "Planning partagé" },
  numbers: { title: "Février", caption: "Pilotage" },
};

const AGENDA = [
  { time: "09:00", name: "Aïssatou D.", service: "Coupe + brushing", price: "18 000", state: "Honoré" },
  { time: "10:15", name: "Fatou N.", service: "Tresses", price: "35 000", state: "En cours" },
  { time: "11:30", name: "Mariam S.", service: "Coloration", price: "28 000", state: "Confirmé" },
  { time: "12:45", name: "Khady B.", service: "Manucure", price: "12 000", state: "En attente" },
  { time: "14:00", name: "Awa T.", service: "Coupe homme", price: "8 000", state: "Confirmé" },
];

const AGENDA_STATES = ["Confirmé", "En cours", "Honoré", "En attente", "Confirmé"];

const CLIENTS = [
  { name: "Aïssatou Diop", visits: 12, total: "214 000", tag: "Habituée" },
  { name: "Fatou Ndiaye", visits: 8, total: "156 000", tag: "En ligne" },
  { name: "Mariam Sow", visits: 5, total: "98 000", tag: "Recommandée" },
  { name: "Khady Bâ", visits: 2, total: "24 000", tag: "Nouvelle" },
];

const CLIENT_TAGS = ["Habituée", "En ligne", "Recommandée", "Nouvelle", "VIP"];

const CATALOGUE = [
  { name: "Coupe + brushing", meta: "45 min", channel: "en ligne", price: "18 000" },
  { name: "Tresses collées", meta: "2 h 30", channel: "en ligne", price: "35 000" },
  { name: "Coloration", meta: "1 h 30", channel: "en ligne", price: "28 000" },
  { name: "Manucure", meta: "40 min", channel: "comptoir", price: "12 000" },
];

const CATALOGUE_CHANNELS = ["en ligne", "comptoir", "en ligne", "sur place"];

const TEAM = [
  { name: "Aminata", hours: "09:00 — 18:00", load: 5 },
  { name: "Cheikh", hours: "10:00 — 19:00", load: 4 },
  { name: "Ndeye", hours: "09:30 — 17:30", load: 3 },
];

const NUMBERS = [
  { label: "Recette", value: 184000, delta: "+12 %" },
  { label: "Rendez-vous", value: 126, delta: "+8 %" },
  { label: "Taux de retour", value: "68 %", delta: "+4 pts" },
];

const SLOTS = ["09:00", "09:45", "10:30", "11:15", "12:00", "14:00", "14:45", "15:30"];
const SLOT_PRICES = ["18 000", "22 000", "15 000", "28 000"];
const STYLISTS = ["Aminata · 45 min", "Cheikh · 30 min", "Ndeye · 1 h"];

const BARS = [36, 52, 44, 68, 58, 74, 82, 70, 88, 96];

const money = (value: string) => `${value} F`;

/* ————————————————————————— Le pouls ————————————————————————— */

/** Un battement toutes les 3,2 s ; une liste entière se rafraîchit une fois sur six. */
const TICK = 3200;
const SWIPE_EVERY = 6;

/**
 * Hasard déterministe (mulberry32) : même graine, même suite. C'est ce qui permet au
 * serveur et au client de peindre le même panneau — `Math.random()` au rendu produirait
 * un texte différent de part et d'autre et une erreur d'hydratation.
 */
function chance(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[Math.floor(chance(seed) * list.length) % list.length];
}

/** Numéro de battement. Zéro au premier rendu, puis un toutes les 3,2 s. */
function usePulse(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setTick((current) => current + 1), TICK);
    return () => window.clearInterval(id);
  }, []);

  return tick;
}

/**
 * Une valeur qui vient de changer.
 *
 * LA CLÉ EST LE TEXTE, pas un numéro de battement. Si la valeur est identique d'un
 * battement à l'autre, la clé ne change pas et rien ne rejoue — sans quoi l'ancienne ligne
 * modifiée rejouerait son animation chaque fois qu'une autre prend le relais, et deux
 * lignes bougeraient pour une seule donnée. Quand le texte change, React remonte le span
 * et `.live-swap` rejoue : la nouvelle valeur arrive en glissant.
 */
function Swap({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span key={String(children)} className={`live-swap ${className}`}>
      {children}
    </span>
  );
}

/** Vrai au battement où toute la liste se réaffiche en cascade. */
const isSwipe = (tick: number) => tick > 0 && tick % SWIPE_EVERY === 0;

/** La clé de la liste : elle change au rafraîchissement complet, et seulement là. */
const listKey = (tick: number) => (isSwipe(tick) ? `swipe-${tick}` : "list");

/** La classe qui fait basculer la liste au rafraîchissement complet — et seulement là. */
const flipClass = (tick: number) => (isSwipe(tick) ? "live-flip" : undefined);

function Frame({ variant, children }: { variant: Variant; children: ReactNode }) {
  const { title, caption } = LABELS[variant];

  return (
    <div aria-hidden className="relative overflow-hidden border border-ink/15 bg-white text-ink">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 px-4 py-3">
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink/40">{caption}</span>
        <span className="font-display text-[0.8rem] leading-none text-ink/70">{title}</span>
      </div>
      {children}

      {/* Le reflet qui traverse la carte : une bande d'encre à 8 %, qui descend lentement
          puis laisse la carte au repos avant de revenir. Elle est au-dessus du contenu mais
          ne prend pas les clics et ne touche qu'à une transformation — rien d'autre à
          recalculer pendant qu'elle passe. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="live-sheen absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(21,17,14,0.08),transparent)]" />
      </div>
    </div>
  );
}

/**
 * UNE LIGNE QUI SE DÉPLACE, et non un texte qui change.
 *
 * Trois mouvements, tous en CSS, tous sur le compositeur :
 *   1. le repère de laiton se déploie en haut de la ligne active (`scale-y`), donc le
 *      regard voit le repère PASSER d'une ligne à l'autre au lieu de sauter ;
 *   2. la ligne active s'indente de 3 px et prend le papier chaud de la page — la
 *      précédente s'éteint en 700 ms, en même temps ;
 *   3. quand les données de la ligne changent (`resetKey`), son contenu REMONTE depuis le
 *      bas de son propre cadre (`live-row`, masqué par `overflow-hidden`) : c'est une
 *      transition de ligne, pas un fondu de caractères.
 *
 * Le masque est porté par la boîte qui s'indente, le mouvement par l'enfant qui remonte :
 * les deux transformations ne se disputent pas le même élément.
 */
function Row({
  active,
  resetKey,
  delay,
  children,
}: {
  active: boolean;
  /** Change quand les données changent : c'est ce qui rejoue la remontée. */
  resetKey: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <li
      className={`relative border-b border-ink/[0.07] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-0 motion-reduce:transition-none ${
        active ? "bg-paper" : "bg-white"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[2px] origin-top bg-brand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          active ? "scale-y-100" : "scale-y-0"
        }`}
      />

      <div
        className={`overflow-hidden px-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          active ? "translate-x-[3px]" : ""
        }`}
      >
        <div key={resetKey} style={{ animationDelay: `${delay}ms` }} className="live-row py-2.5">
          {children}
        </div>
      </div>
    </li>
  );
}

/* ————————————————————————— Les variantes ————————————————————————— */

function AgendaPanel() {
  const tick = usePulse();
  const changed = tick === 0 ? -1 : Math.floor(chance(tick * 17 + 3) * AGENDA.length);
  const rows = useMemo(
    () =>
      AGENDA.map((row, i) =>
        i === changed ? { ...row, state: pick(AGENDA_STATES, tick * 31 + 7) } : row,
      ),
    [changed, tick],
  );

  return (
    <ul key={listKey(tick)} className={flipClass(tick)}>
      {rows.map((row, i) => (
        <Row
          key={row.time}
          active={i === changed}
          resetKey={`${row.state}-${row.price}`}
          delay={i * 55}
        >
          <div className="grid grid-cols-[3.2rem_minmax(0,1fr)_auto] items-baseline gap-3">
            <span className="font-display text-[0.8rem] tabular-nums text-ink/55">{row.time}</span>
            <span className="min-w-0">
              <span className="block truncate text-[0.8rem] text-ink">{row.name}</span>
              <span className="block truncate text-[0.68rem] text-ink/45">{row.service}</span>
            </span>
            <span className="text-right">
              <span className="block text-[0.7rem] tabular-nums text-ink/70">{money(row.price)}</span>
              <span className="block text-[0.55rem] uppercase tracking-[0.12em] text-brand">
                {row.state}
              </span>
            </span>
          </div>
        </Row>
      ))}
    </ul>
  );
}

function TeamPanel() {
  const tick = usePulse();
  const changed = tick === 0 ? -1 : Math.floor(chance(tick * 23 + 5) * TEAM.length);
  const rows = TEAM.map((row, i) =>
    i === changed ? { ...row, load: 2 + Math.floor(chance(tick * 29 + 11) * 5) } : row,
  );

  return (
    <ul key={listKey(tick)} className={flipClass(tick)}>
      {rows.map((row, i) => (
        <Row
          key={row.name}
          active={i === changed}
          resetKey={`${row.load}`}
          delay={i * 55}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
            <span>
              <span className="block text-[0.8rem] text-ink">{row.name}</span>
              <span className="block text-[0.68rem] tabular-nums text-ink/45">{row.hours}</span>
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.12em] text-ink/40">
              {row.load} rendez-vous
            </span>
          </div>
        </Row>
      ))}
    </ul>
  );
}

function BookingPanel() {
  const tick = usePulse();
  /* Le créneau sélectionné saute d'une case à l'autre : c'est la pastille qui glisse,
     pas le tableau qui se réaffiche. Le premier battement ne bouge pas. */
  const active = tick === 0 ? 1 : Math.floor(chance(tick * 13 + 2) * SLOTS.length);
  const price = tick === 0 ? SLOT_PRICES[0] : pick(SLOT_PRICES, tick * 19 + 4);
  const stylist = tick === 0 ? STYLISTS[0] : pick(STYLISTS, tick * 37 + 6);

  return (
    <div className="space-y-4 px-4 py-4">
      <div>
        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Prestation</span>
        <p className="mt-1 flex items-baseline justify-between gap-3 text-[0.85rem] text-ink">
          Coupe + brushing
          <Swap className="text-[0.75rem] tabular-nums text-ink/60">
            {money(price)}
          </Swap>
        </p>
      </div>

      <div>
        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Avec</span>
        <Swap className="mt-1 block text-[0.85rem] text-ink">
          {stylist}
        </Swap>
      </div>

      <div>
        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Créneau</span>

        {/* La grille des créneaux : la sélection est une PASTILLE qui glisse d'une case à
            l'autre (transform, donc sur le compositeur), pendant que la couleur du texte
            suit en fondu. Une seule animation à la fois, et le tableau ne clignote pas. */}
        <div className="relative mt-2 grid grid-cols-4 gap-px bg-ink/10">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 h-1/2 w-1/4 bg-ink transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transform: `translate(${(active % 4) * 100}%, ${Math.floor(active / 4) * 100}%)`,
            }}
          />

          {SLOTS.map((slot, i) => (
            <span
              key={slot}
              className={`relative bg-white py-2 text-center text-[0.7rem] tabular-nums transition-colors duration-500 motion-reduce:transition-none ${
                i === active
                  ? "text-paper"
                  : slot === "12:00"
                    ? "text-ink/25 line-through"
                    : "text-ink/60"
              }`}
            >
              <span className="relative z-20">{slot}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <span className="text-[0.65rem] text-ink/45">Confirmation immédiate</span>
        <span className="bg-ink px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-paper">
          Réserver
        </span>
      </div>
    </div>
  );
}

function ClientsPanel() {
  const tick = usePulse();
  const changed = tick === 0 ? -1 : Math.floor(chance(tick * 41 + 9) * CLIENTS.length);
  const rows = CLIENTS.map((row, i) =>
    i === changed
      ? {
          ...row,
          tag: pick(CLIENT_TAGS, tick * 43 + 13),
          visits: row.visits + 1,
          total: String(Number(row.total.replace(/\s/g, "")) + 8000).replace(
            /\B(?=(\d{3})+(?!\d))/g,
            " ",
          ),
        }
      : row,
  );

  return (
    <ul key={listKey(tick)} className={flipClass(tick)}>
      {rows.map((row, i) => (
        <Row
          key={row.name}
          active={i === changed}
          resetKey={`${row.tag}-${row.visits}-${row.total}`}
          delay={i * 55}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[0.8rem] text-ink">{row.name}</span>
              <span className="block text-[0.68rem] tabular-nums text-ink/45">
                {row.visits} visites · {row.total}
              </span>
            </span>
            <span className="shrink-0 text-[0.55rem] uppercase tracking-[0.12em] text-brand">
              {row.tag}
            </span>
          </div>
        </Row>
      ))}
    </ul>
  );
}

function CataloguePanel() {
  const tick = usePulse();
  const changed = tick === 0 ? -1 : Math.floor(chance(tick * 47 + 15) * CATALOGUE.length);
  const rows = CATALOGUE.map((row, i) =>
    i === changed ? { ...row, channel: pick(CATALOGUE_CHANNELS, tick * 53 + 17) } : row,
  );

  return (
    <ul key={listKey(tick)} className={flipClass(tick)}>
      {rows.map((row, i) => (
        <Row
          key={row.name}
          active={i === changed}
          resetKey={row.channel}
          delay={i * 55}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[0.8rem] text-ink">{row.name}</span>
              <span className="block text-[0.66rem] uppercase tracking-[0.1em] text-ink/40">
                {row.meta} · {row.channel}
              </span>
            </span>
            <span className="font-display text-[0.82rem] tabular-nums text-ink/75">
              {money(row.price)}
            </span>
          </div>
        </Row>
      ))}
    </ul>
  );
}

function NumbersPanel() {
  const tick = usePulse();
  /* Les KPI bougent par petits pas, jamais au hasard d'un grand saut : une recette qui
     passe de 184 000 à 40 000 en un battement ne se lit pas comme un écran vivant. */
  const step = tick % 3;
  const revenue = 184000 + Math.round(chance(tick * 7 + 1) * 24 - 8) * 500;
  const appointments = 126 + Math.round(chance(tick * 11 + 3) * 12 - 5);
  const values =
    tick === 0
      ? NUMBERS.map((row) => String(row.value))
      : [
          revenue.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " "),
          String(appointments),
          step === 0 ? "68 %" : step === 1 ? "71 %" : "66 %",
        ];
  const deltas = tick === 0 ? NUMBERS.map((row) => row.delta) : ["+12 %", "+11 %", "+6 pts"];

  /* Le repère des KPI : une colonne s'allume à son tour, de gauche à droite, à chaque
     battement. C'est la même écriture que le repère des lignes, tournée à l'horizontale. */
  const active = tick === 0 ? -1 : tick % NUMBERS.length;

  return (
    <>
      <dl key={listKey(tick)} className={`grid grid-cols-3 gap-px bg-ink/10 ${flipClass(tick) ?? ""}`}>
        {NUMBERS.map((row, i) => (
          <div
            key={row.label}
            style={{ animationDelay: `${i * 55}ms` }}
            className={`live-row relative px-3 py-4 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              i === active ? "bg-paper" : "bg-white"
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-brand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                i === active ? "scale-x-100" : "scale-x-0"
              }`}
            />

            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-ink/40">{row.label}</dt>
            <dd className="mt-2 font-display text-lg leading-none tabular-nums text-ink">
              <Swap className="inline">
                {values[i]}
              </Swap>
            </dd>
            <span className="mt-2 block text-[0.6rem] text-brand">{deltas[i]}</span>
          </div>
        ))}
      </dl>

      <div className="flex items-end gap-1 border-t border-ink/10 px-4 py-4">
        {BARS.map((height, i) => (
          <span
            key={i}
            className="flex-1 bg-ink/15 transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            /* La barre respire avec le battement : ± 12 %, jamais plus — un histogramme
               qui saute d'un tiers ferait croire à une erreur de données. */
            style={{
              height: `${height * 0.45 * (tick === 0 ? 1 : 0.88 + chance(tick * 61 + i) * 0.24)}px`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ————————————————————————— Le point d'entrée ————————————————————————— */

export function ProductPanel({ variant = "agenda" }: { variant?: Variant }) {
  if (variant === "booking") {
    return (
      <Frame variant={variant}>
        <BookingPanel />
      </Frame>
    );
  }

  if (variant === "clients") {
    return (
      <Frame variant={variant}>
        <ClientsPanel />
      </Frame>
    );
  }

  if (variant === "catalogue") {
    return (
      <Frame variant={variant}>
        <CataloguePanel />
      </Frame>
    );
  }

  if (variant === "team") {
    return (
      <Frame variant={variant}>
        <TeamPanel />
        <div className="flex items-baseline justify-between gap-3 border-t border-ink/10 px-4 py-2.5">
          <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/35">3 personnes</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
        </div>
      </Frame>
    );
  }

  if (variant === "numbers") {
    return (
      <Frame variant={variant}>
        <NumbersPanel />
      </Frame>
    );
  }

  return (
    <Frame variant="agenda">
      <AgendaPanel />
      <div className="flex items-baseline justify-between gap-3 border-t border-ink/10 px-4 py-2.5">
        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/35">5 rendez-vous</span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
      </div>
    </Frame>
  );
}
