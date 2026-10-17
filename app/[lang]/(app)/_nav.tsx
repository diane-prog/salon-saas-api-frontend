"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useDictionary } from "@/components/DictionaryProvider";
import { useLogout } from "@/features/auth/queries";
import { useTenant, useTenantSettings } from "@/features/tenant/queries";
import { LABEL } from "@/lib/editorial";

/**
 * Navigation de l'espace salon, et la déconnexion.
 *
 * POURQUOI DES GROUPES : quinze liens à plat ne disent pas dans quel ordre on
 * travaille. Ils sont donc rangés par moment de la journée — le jour, les
 * clientes, le salon, le compte — avec un intitulé de groupe. C'est la même
 * matière, mais on sait où l'on va avant de cliquer.
 *
 * `sections` est la SEULE source : chaque écran ajouté s'y inscrit, et le
 * libellé vient du dictionnaire. On n'affiche donc jamais un lien vers une
 * route qui n'existe pas.
 *
 * Le nom affiché est celui du SALON (`/tenant/me`), pas celui du logiciel : un
 * gérant doit reconnaître sa maison dès la première ligne. La requête est déjà
 * en cache pour l'écran Réglages, donc elle ne coûte rien ici ; après une
 * modification de l'identité, l'invalidation la rafraîchit partout.
 */
export type WorkspaceSection = { readonly key: keyof SectionKeys; readonly href: string };
export type WorkspaceGroup = {
  readonly key: "day" | "clients" | "salon" | "account";
  readonly items: readonly WorkspaceSection[];
};

type SectionKeys = {
  overview: string;
  appointments: string;
  calendar: string;
  customers: string;
  services: string;
  staff: string;
  gallery: string;
  reviews: string;
  messages: string;
  notifications: string;
  analytics: string;
  billing: string;
  team: string;
  audit: string;
  settings: string;
};

export default function WorkspaceNav({ groups }: { readonly groups: readonly WorkspaceGroup[] }) {
  const { dict, locale } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const tenantQ = useTenant();
  const settingsQ = useTenantSettings();

  const labels = dict.ui.dashboard.nav;
  const groupLabels = dict.ui.dashboard.groups;
  const tenant = tenantQ.data;
  const salonName = tenant?.name ?? dict.site.name;
  /* La couleur choisie dans Réglages habille l'espace : c'est ce qui rend un
     changement de préférence visible immédiatement, et pas seulement sur la
     vitrine publique. */
  const accent = settingsQ.data?.primaryColor ?? undefined;

  const signOut = async () => {
    await logout.mutateAsync();
    router.replace(`/${locale}/login`);
  };

  return (
    <div className="flex h-full flex-col gap-5 lg:gap-8">
      <Link
        href={`/${locale}/dashboard`}
        className="group flex items-start justify-between gap-3 border-b border-paper/10 pb-3 text-paper lg:pb-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          {tenant?.logo && (
            // eslint-disable-next-line @next/next/no-img-element -- logo fourni par le salon (URL externe), hors liste blanche connue à la compilation
            <img
              src={tenant.logo}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          )}

          <span className="min-w-0">
            <span className="block truncate font-display text-xl leading-tight transition-colors group-hover:text-turquoise">
              {salonName}
            </span>
            <span className={`mt-1 block ${LABEL} text-paper/35`}>
              {dict.ui.dashboard.brand}
            </span>
          </span>
        </span>
        <span
          aria-hidden
          className="mt-1 hidden h-6 w-6 shrink-0 place-items-center border border-paper/15 text-[0.6rem] text-paper/40 transition-colors group-hover:border-turquoise/50 group-hover:text-turquoise lg:grid"
        >
          ↗
        </span>
      </Link>

      {/* Sur téléphone, la navigation devient une bande horizontale : quinze liens
          empilés repousseraient le contenu hors de l'écran. Les intitulés de groupe
          n'ont de sens qu'en colonne, où ils séparent des blocs. */}
      <nav
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
        aria-label={dict.ui.dashboard.brand}
      >
        {groups.map((group) => (
          <div key={group.key} className="flex shrink-0 gap-1 lg:flex-col">
            <span className={`hidden px-3 pb-1 lg:block ${LABEL} text-paper/25`}>
              {groupLabels[group.key]}
            </span>

            {group.items.map((section) => {
              const href = `/${locale}${section.href}`;
              const current = pathname === href;

              return (
                <Link
                  key={section.key}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                    current
                      ? "bg-paper/[0.08] text-paper"
                      : "text-paper/55 hover:bg-paper/[0.05] hover:text-paper"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1 w-1 shrink-0 rounded-full ${
                      current ? "" : "bg-paper/15"
                    }`}
                    style={current ? { background: accent ?? "#d8c3a0" } : undefined}
                  />
                  {labels[section.key]}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-row items-center gap-1 border-t border-paper/10 pt-3 text-sm lg:flex-col lg:items-stretch lg:pt-5">
        <Link
          href={`/${locale}`}
          className="px-3 py-1.5 text-paper/50 transition-colors hover:text-paper"
        >
          {dict.ui.dashboard.viewSite}
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={logout.isPending}
          className="px-3 py-1.5 text-left text-paper/50 transition-colors hover:text-turquoise disabled:opacity-60"
        >
          {dict.ui.dashboard.logout}
        </button>
      </div>
    </div>
  );
}
