"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDictionary } from "@/components/DictionaryProvider";
import type { WorkspaceGroup } from "@/app/[lang]/(app)/_nav";
import { useMyNotifications } from "@/features/notifications/queries";
import { useTenant } from "@/features/tenant/queries";
import { LABEL } from "@/lib/editorial";

/**
 * En-tête de l'espace salon — la barre qui manquait.
 *
 * POURQUOI ELLE EXISTE : l'espace n'avait qu'une colonne d'encre à gauche et le contenu à
 * droite. On savait donc *où* on était par la ligne surlignée du menu, mais rien en haut de
 * l'écran ne disait **où l'on est dans le travail** (le groupe, l'écran), **quel jour on
 * regarde**, ni ce qui réclame une action (les notifications non lues), ni comment revenir à
 * la vitrine publique ou prendre un rendez-vous en un geste. C'est le rôle de cette barre :
 * du contexte à gauche, des sorties à droite.
 *
 * ELLE EST COLLANTE (`sticky`) parce que ces informations servent pendant qu'on travaille :
 * arrivé en bas d'un tableau de trente lignes, on doit encore pouvoir prendre un rendez-vous
 * ou voir que deux notifications attendent. Le fond est du papier à peine translucide, avec
 * un filet — pas d'ombre, pas de dégradé : la même matière que le reste du site.
 *
 * ELLE LIT LES MÊMES SOURCES QUE LE RESTE : le contexte vient des `groups` passés par la
 * layout (une seule liste, donc un libellé qu'on ne peut pas désynchroniser du menu), le lien
 * vitrine du salon (`/tenant/me`, déjà en cache), et le badge des notifications de la
 * personne connectée (`/notifications/me`). Rien n'est inventé : sans salon chargé, il n'y a
 * simplement pas de lien vitrine, et le badge disparaît à zéro.
 */
export default function WorkspaceHeader({ groups }: { readonly groups: readonly WorkspaceGroup[] }) {
  const { dict, locale } = useDictionary();
  const pathname = usePathname();
  const tenantQ = useTenant();
  const notificationsQ = useMyNotifications();

  const labels = dict.ui.dashboard;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";
  const tenant = tenantQ.data;

  const currentHref = `/${locale}${pathname.replace(`/${locale}`, "")}`;
  const currentGroup = groups.find((group) =>
    group.items.some((item) => `/${locale}${item.href}` === currentHref),
  );
  const currentItem = currentGroup?.items.find((item) => `/${locale}${item.href}` === currentHref);

  const unread = (notificationsQ.data ?? []).filter((item) => item.status !== "READ").length;

  /* Le jour, en toutes lettres : c'est la première chose qu'on vérifie en ouvrant l'espace,
     et elle évite de se tromper de journée en lisant un agenda. */
  const today = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8 lg:px-12">
        {/* ——— Contexte : le groupe, puis l'écran. Les deux viennent de la même liste que le
                menu, donc ils ne peuvent pas se contredire. */}
        <div className="flex min-w-0 items-center gap-3">
          {currentGroup && (
            <>
              <span className={`${LABEL} shrink-0 text-brand`}>
                {labels.groups[currentGroup.key]}
              </span>
              <span aria-hidden className="h-3 w-px shrink-0 bg-ink/15" />
            </>
          )}
          <span className="truncate font-display text-[1.3rem] leading-none tracking-[-0.01em] text-ink">
            {currentItem ? labels.nav[currentItem.key] : labels.brand}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="hidden border-l border-ink/10 pl-4 text-[0.66rem] uppercase tracking-[0.16em] tabular-nums text-ink/45 first-letter:uppercase sm:inline">
            {today}
          </span>

          <Link
            href={`/${locale}/dashboard/notifications`}
            className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-ink"
          >
            {labels.nav.notifications}
            {unread > 0 && (
              <span className="grid h-4 min-w-4 place-items-center bg-brand px-1 text-[0.6rem] tabular-nums text-paper">
                {unread}
              </span>
            )}
          </Link>

          {tenant?.slug && (
            <a
              href={`/${locale}/s/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-[0.66rem] uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-ink sm:inline"
            >
              {labels.viewSite} ↗
            </a>
          )}

          <Link
            href={`/${locale}/dashboard/appointments`}
            aria-label={labels.screens.appointments.add}
            className="bg-ink px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-brand"
          >
            <span className="hidden sm:inline">{labels.screens.appointments.add}</span>
            <span aria-hidden className="sm:hidden">
              +
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
