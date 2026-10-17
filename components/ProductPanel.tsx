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

const CLIENTS = [
  { name: "Aïssatou Diop", meta: "12 visites · 214 000", tag: "Habituée" },
  { name: "Fatou Ndiaye", meta: "8 visites · 156 000", tag: "En ligne" },
  { name: "Mariam Sow", meta: "5 visites · 98 000", tag: "Recommandée" },
  { name: "Khady Bâ", meta: "2 visites · 24 000", tag: "Nouvelle" },
];

const CATALOGUE = [
  { name: "Coupe + brushing", meta: "45 min · en ligne", price: "18 000" },
  { name: "Tresses collées", meta: "2 h 30 · en ligne", price: "35 000" },
  { name: "Coloration", meta: "1 h 30 · en ligne", price: "28 000" },
  { name: "Manucure", meta: "40 min · comptoir", price: "12 000" },
];

const TEAM = [
  { name: "Aminata", hours: "09:00 — 18:00", load: "5 rendez-vous" },
  { name: "Cheikh", hours: "10:00 — 19:00", load: "4 rendez-vous" },
  { name: "Ndeye", hours: "09:30 — 17:30", load: "3 rendez-vous" },
];

const NUMBERS = [
  { label: "Recette", value: "184 000", delta: "+12 %" },
  { label: "Rendez-vous", value: "126", delta: "+8 %" },
  { label: "Taux de retour", value: "68 %", delta: "+4 pts" },
];

const money = (value: string) => `${value} F`;

function Frame({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  const { title, caption } = LABELS[variant];

  return (
    <div aria-hidden className="border border-ink/15 bg-white text-ink">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 px-4 py-3">
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink/40">{caption}</span>
        <span className="font-display text-[0.8rem] leading-none text-ink/70">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function ProductPanel({ variant = "agenda" }: { variant?: Variant }) {
  if (variant === "agenda" || variant === "team") {
    return (
      <Frame variant={variant}>
        <ul>
          {variant === "agenda"
            ? AGENDA.map((row) => (
                <li
                  key={row.time}
                  className="grid grid-cols-[3.2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-ink/[0.07] px-4 py-2.5 last:border-0"
                >
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
                </li>
              ))
            : TEAM.map((row) => (
                <li
                  key={row.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-ink/[0.07] px-4 py-3 last:border-0"
                >
                  <span>
                    <span className="block text-[0.8rem] text-ink">{row.name}</span>
                    <span className="block text-[0.68rem] tabular-nums text-ink/45">{row.hours}</span>
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.12em] text-ink/40">{row.load}</span>
                </li>
              ))}
        </ul>
        <div className="flex items-baseline justify-between gap-3 border-t border-ink/10 px-4 py-2.5">
          <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/35">
            {variant === "agenda" ? "5 rendez-vous" : "3 personnes"}
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
        </div>
      </Frame>
    );
  }

  if (variant === "booking") {
    return (
      <Frame variant={variant}>
        <div className="space-y-4 px-4 py-4">
          <div>
            <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Prestation</span>
            <p className="mt-1 flex items-baseline justify-between gap-3 text-[0.85rem] text-ink">
              Coupe + brushing
              <span className="text-[0.75rem] tabular-nums text-ink/60">{money("18 000")}</span>
            </p>
          </div>

          <div>
            <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Avec</span>
            <p className="mt-1 text-[0.85rem] text-ink">Aminata · 45 min</p>
          </div>

          <div>
            <span className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/40">Créneau</span>
            <div className="mt-2 grid grid-cols-4 gap-px bg-ink/10">
              {["09:00", "09:45", "10:30", "11:15"].map((slot, i) => (
                <span
                  key={slot}
                  className={`bg-white py-2 text-center text-[0.7rem] tabular-nums ${
                    i === 1 ? "bg-ink text-paper" : "text-ink/60"
                  }`}
                >
                  {slot}
                </span>
              ))}
              {["12:00", "14:00", "14:45", "15:30"].map((slot, i) => (
                <span
                  key={slot}
                  className={`bg-white py-2 text-center text-[0.7rem] tabular-nums ${
                    i === 0 ? "text-ink/25 line-through" : "text-ink/60"
                  }`}
                >
                  {slot}
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
      </Frame>
    );
  }

  if (variant === "clients") {
    return (
      <Frame variant={variant}>
        <ul>
          {CLIENTS.map((row) => (
            <li
              key={row.name}
              className="flex items-baseline justify-between gap-3 border-b border-ink/[0.07] px-4 py-2.5 last:border-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.8rem] text-ink">{row.name}</span>
                <span className="block text-[0.68rem] tabular-nums text-ink/45">{row.meta}</span>
              </span>
              <span className="shrink-0 text-[0.55rem] uppercase tracking-[0.12em] text-brand">
                {row.tag}
              </span>
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  if (variant === "catalogue") {
    return (
      <Frame variant={variant}>
        <ul>
          {CATALOGUE.map((row) => (
            <li
              key={row.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-ink/[0.07] px-4 py-2.5 last:border-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.8rem] text-ink">{row.name}</span>
                <span className="block text-[0.66rem] uppercase tracking-[0.1em] text-ink/40">
                  {row.meta}
                </span>
              </span>
              <span className="font-display text-[0.82rem] tabular-nums text-ink/75">{money(row.price)}</span>
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  return (
    <Frame variant={variant}>
      <dl className="grid grid-cols-3 gap-px bg-ink/10">
        {NUMBERS.map((row) => (
          <div key={row.label} className="bg-white px-3 py-4">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-ink/40">{row.label}</dt>
            <dd className="mt-2 font-display text-lg leading-none tabular-nums text-ink">{row.value}</dd>
            <span className="mt-2 block text-[0.6rem] text-brand">{row.delta}</span>
          </div>
        ))}
      </dl>
      <div className="flex items-end gap-1 border-t border-ink/10 px-4 py-4" aria-hidden>
        {[36, 52, 44, 68, 58, 74, 82, 70, 88, 96].map((height, i) => (
          <span
            key={i}
            className="flex-1 bg-ink/15"
            style={{ height: `${height * 0.45}px` }}
          />
        ))}
      </div>
    </Frame>
  );
}
