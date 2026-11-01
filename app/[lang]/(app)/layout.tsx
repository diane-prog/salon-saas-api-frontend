import type { Metadata } from "next";
import { notFound } from "next/navigation";

import WorkspaceGuard from "./_guard";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceNav, { type WorkspaceGroup } from "./_nav";
import { isLocale } from "@/lib/dictionaries";

/* Espace privé : rien à indexer. `follow: false` évite aussi de faire suivre aux
   moteurs les liens internes d'un tableau de bord inaccessible sans compte. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Coquille de l'ESPACE SALON.
 *
 * Deux colonnes : la navigation sur l'encre à gauche (fixe), le travail sur le
 * papier à droite — surmonté de la barre de contexte (`WorkspaceHeader`), qui dit
 * où l'on est, quel jour on regarde et ce qui demande une action. Aucun en-tête
 * marketing, aucune barre d'actions flottante, et surtout **pas de défilement
 * lissé** : Lenis est monté dans `(site)`, donc les tableaux de l'espace se
 * parcourent au défilement natif.
 *
 * `GROUPS` ne contient que les écrans réellement construits, rangés par moment
 * de travail : le jour, les clientes, le salon, le compte. Le dictionnaire
 * porte déjà tous les libellés (`ui.dashboard.nav` et `ui.dashboard.groups`) :
 * ouvrir un écran, c'est ajouter une ligne ici, et jamais un lien vers une route
 * inexistante.
 */
const GROUPS: readonly WorkspaceGroup[] = [
  {
    key: "day",
    items: [
      { key: "overview", href: "/dashboard" },
      { key: "appointments", href: "/dashboard/appointments" },
      { key: "calendar", href: "/dashboard/calendar" },
      { key: "analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    key: "clients",
    items: [
      { key: "customers", href: "/dashboard/customers" },
      { key: "messages", href: "/dashboard/messages" },
      { key: "reviews", href: "/dashboard/reviews" },
    ],
  },
  {
    key: "salon",
    items: [
      { key: "services", href: "/dashboard/services" },
      { key: "staff", href: "/dashboard/staff" },
      { key: "gallery", href: "/dashboard/gallery" },
      { key: "settings", href: "/dashboard/settings" },
    ],
  },
  {
    key: "account",
    items: [
      { key: "team", href: "/dashboard/team" },
      { key: "billing", href: "/dashboard/billing" },
      { key: "notifications", href: "/dashboard/notifications" },
      { key: "audit", href: "/dashboard/audit" },
    ],
  },
];

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <WorkspaceGuard>
      <div className="grid min-h-svh lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* ——— Colonne encre. Sur téléphone elle passe EN HAUT, en bandeau : une
                colonne latérale de 16 rem sur un écran de 390 px ne laisserait rien. */}
        <aside className="bg-ink px-5 py-5 text-paper lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto lg:px-6 lg:py-8">
          <WorkspaceNav groups={GROUPS} />
        </aside>

        <main className="min-w-0 bg-paper">
          {/* La barre reste collante pendant qu'on descend un écran : le contexte, le jour,
              les notifications non lues et le geste « nouveau rendez-vous » suivent. */}
          <WorkspaceHeader groups={GROUPS} />

          <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </WorkspaceGuard>
  );
}
