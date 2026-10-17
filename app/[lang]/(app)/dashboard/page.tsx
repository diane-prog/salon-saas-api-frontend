"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { LoadError, Loading } from "@/components/workspace/States";
import type { Appointment } from "@/features/appointments/types";
import { useCurrentUser } from "@/features/auth/queries";
import { useDashboardOverview } from "@/features/dashboard/queries";
import { useCustomers } from "@/features/customers/queries";
import { useSalonServiceItems } from "@/features/salon-services/queries";
import { useStaffMembers } from "@/features/staff/queries";
import { useTenant, useTenantStats } from "@/features/tenant/queries";
import { BODY, LABEL } from "@/lib/editorial";
import { formatPrice } from "@/lib/price";

/**
 * Vue du jour — l'écran d'arrivée du salon.
 *
 * CE QUI A CHANGÉ, ET POURQUOI : l'écran précédent alignait quatre chiffres,
 * deux listes et une ligne de compteurs. Il répondait à « quels sont les
 * chiffres ? » mais pas à la question qu'on se pose en ouvrant un logiciel de
 * salon le matin : **« qu'est-ce que j'ai à faire maintenant ? »**.
 *
 * D'où trois gestes, en haut, dans l'ordre de la journée :
 *
 *   1. les rendez-vous **à confirmer** — le seul chiffre qui demande un clic ;
 *   2. le **prochain** rendez-vous — pour se situer ;
 *   3. la **vitrine** — la preuve que le logiciel travaille pendant qu'on dort
 *      (elle prend des réservations 24 h/24). Le lien est l'adresse publique
 *      réelle du salon, lue sur `/tenant/me`.
 *
 * Aucune valeur n'est calculée côté client : `GET /dashboard` rend le résumé du
 * jour, `/tenant/stats` les compteurs. Un identifiant sans correspondance
 * s'affiche « — », jamais un nom inventé.
 */
export default function DashboardOverviewPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard;
  const overview = labels.overview;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const userQ = useCurrentUser();
  const dashboardQ = useDashboardOverview();
  const statsQ = useTenantStats();
  const tenantQ = useTenant();

  const customersQ = useCustomers();
  const servicesQ = useSalonServiceItems();
  const staffQ = useStaffMembers();

  const customers = useMemo(
    () =>
      new Map(
        (customersQ.data ?? []).map((customer) => [
          customer.id,
          `${customer.firstName} ${customer.lastName}`.trim(),
        ]),
      ),
    [customersQ.data],
  );
  const services = useMemo(
    () => new Map((servicesQ.data ?? []).map((service) => [service.id, service.name])),
    [servicesQ.data],
  );
  const staff = useMemo(
    () =>
      new Map(
        (staffQ.data ?? []).map((member) => [
          member.id,
          `${member.firstName} ${member.lastName}`.trim(),
        ]),
      ),
    [staffQ.data],
  );

  if (dashboardQ.isPending) {
    return <Loading />;
  }

  if (dashboardQ.isError || !dashboardQ.data) {
    return <LoadError onRetry={() => dashboardQ.refetch()} />;
  }

  const data = dashboardQ.data;
  const stats = statsQ.data;
  const user = userQ.data?.data;
  const tenant = tenantQ.data;
  const salonName = tenant?.name ?? data.tenant?.name ?? dict.site.name;

  const money = (amount: number | string | undefined) =>
    amount === undefined
      ? "—"
      : formatPrice(amount, dict.storefront.priceCurrency, intlLocale);

  const pending = data.today?.pending ?? 0;
  const upcoming = data.upcomingAppointments ?? [];
  const next = upcoming[0];
  const firstName = user?.email.split("@")[0] ?? "";

  const dayLabel = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const figures = [
    { key: "appointments", label: overview.todayAppointments, value: data.today?.appointments ?? 0 },
    { key: "pending", label: overview.todayPending, value: pending },
    { key: "completed", label: overview.todayCompleted, value: data.today?.completed ?? 0 },
    { key: "revenue", label: overview.todayRevenue, value: money(data.today?.revenue) },
  ];

  /*
   * Mise en route. Chaque étape est VÉRIFIÉE sur une donnée du serveur, pas sur un clic
   * mémorisé : le slug vient de `/tenant/me`, les quatre autres de `/tenant/stats`. C'est
   * la différence entre une liste de courses et un état réel — et c'est ce qui permet à
   * un salon déjà installé de ne jamais voir cette section.
   */
  const setup = [
    { key: "slug", done: Boolean(tenant?.slug), href: "/dashboard/settings" },
    { key: "services", done: (stats?.counts.services ?? 0) > 0, href: "/dashboard/services" },
    { key: "staff", done: (stats?.counts.staff ?? 0) > 0, href: "/dashboard/staff" },
    { key: "gallery", done: (stats?.counts.gallery ?? 0) > 0, href: "/dashboard/gallery" },
    { key: "booking", done: (stats?.counts.appointments ?? 0) > 0, href: "/dashboard/appointments" },
  ] as const;

  const setupDone = setup.filter((step) => step.done).length;
  const setupOpen = setupDone < setup.length;

  const rows = (list: Appointment[], empty: string) =>
    list.length === 0 ? (
      <p className={`${BODY} text-ink/45`}>{empty}</p>
    ) : (
      <ul className="border-y border-ink/10 bg-white">
        {list.map((appointment) => (
          <li
            key={appointment.id}
            className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/[0.07] px-5 py-3.5 text-sm last:border-0"
          >
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="w-12 font-display tabular-nums text-ink">
                {appointment.startTime}
              </span>
              <span className="text-ink/75">{customers.get(appointment.customerId) ?? "—"}</span>
              <span className="text-xs text-ink/45">
                {services.get(appointment.serviceId) ?? "—"}
                {staff.get(appointment.staffId) && <> · {staff.get(appointment.staffId)}</>}
              </span>
            </span>

            <span className="flex items-baseline gap-3">
              <span className="tabular-nums text-xs text-ink/55">{money(appointment.price)}</span>
              <span className={`${LABEL} text-ink/40`}>
                {labels.screens.appointments.statuses[appointment.status]}
              </span>
            </span>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 border-b border-ink/10 pb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className={`${LABEL} text-ink/40`}>{overview.eyebrow}</span>
          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-ink/40 first-letter:uppercase">
            {dayLabel}
          </span>
        </div>

        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.04] tracking-[-0.015em] text-ink">
          {salonName}
        </h1>

        <p className={`max-w-xl ${BODY} text-ink/60`}>
          {firstName ? `${overview.greeting}, ${firstName}. ` : `${overview.greeting}. `}
          {pending > 0
            ? `${pending} ${overview.actions.confirmLabel}`
            : overview.actions.confirmNone}
        </p>
      </header>

      {/* ——— La mise en route : où en est le salon dans son installation.
              Affichée seulement tant qu'il reste une étape : un salon qui a déjà ses
              prestations, son équipe et ses rendez-vous n'a pas besoin d'une liste de
              courses pour lui rappeler ce qu'il a fait. */}
      {stats && setupOpen && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className={`${LABEL} text-ink/40`}>{overview.setupTitle}</h2>
            <span className="text-[0.68rem] uppercase tracking-[0.14em] tabular-nums text-ink/40">
              {setupDone}/{setup.length}
            </span>
          </div>

          <p className={`max-w-2xl ${BODY} text-ink/55`}>{overview.setupBody}</p>

          <ol className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
            {setup.map((step, index) => {
              const copy = overview.setupSteps.find((item) => item.key === step.key);

              return (
                <li key={step.key} className="flex flex-col justify-between gap-5 bg-white p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`${LABEL} tabular-nums ${step.done ? "text-brand/70" : "text-ink/30"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[0.56rem] uppercase tracking-[0.14em] ${
                        step.done ? "text-brand" : "text-ink/40"
                      }`}
                    >
                      {step.done ? overview.setupDone : overview.setupTodo}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-[1.05rem] leading-tight text-ink">
                      {copy?.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink/50">{copy?.hint}</p>
                  </div>

                  {!step.done && (
                    <Link
                      href={`/${locale}${step.href}`}
                      className="text-[0.62rem] uppercase tracking-[0.14em] text-brand transition-colors hover:text-ink"
                    >
                      {overview.setupCta} →
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ——— Les trois gestes, dans l'ordre de la journée. */}
      <section className="flex flex-col gap-3">
        <h2 className={`${LABEL} text-ink/40`}>{overview.actions.title}</h2>

        <div className="grid gap-px bg-ink/10 lg:grid-cols-3">
          <Link
            href={`/${locale}/dashboard/appointments`}
            className="group flex flex-col justify-between gap-6 bg-white p-5 transition-colors hover:bg-ink/[0.02]"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className={`${LABEL} text-ink/40`}>{overview.actions.confirmTitle}</span>
              <span className="font-display text-2xl tabular-nums text-ink">{pending}</span>
            </span>
            <span className="text-sm leading-relaxed text-ink/55">
              {pending > 0 ? overview.actions.confirmHint : overview.actions.confirmNone}
            </span>
            <span className="text-[0.66rem] uppercase tracking-[0.16em] text-brand">
              {overview.actions.confirmCta}
            </span>
          </Link>

          <Link
            href={`/${locale}/dashboard/calendar`}
            className="group flex flex-col justify-between gap-6 bg-white p-5 transition-colors hover:bg-ink/[0.02]"
          >
            <span className={`${LABEL} text-ink/40`}>{overview.actions.nextTitle}</span>
            <span className="font-display text-xl leading-tight text-ink">
              {next ? (
                <>
                  {next.startTime}
                  <span className="ml-2 text-sm text-ink/50">
                    {customers.get(next.customerId) ?? "—"}
                  </span>
                </>
              ) : (
                <span className="text-base text-ink/45">{overview.actions.nextNone}</span>
              )}
            </span>
            <span className="text-[0.66rem] uppercase tracking-[0.16em] text-brand">
              {overview.actions.nextCta}
            </span>
          </Link>

          <Link
            href={tenant?.slug ? `/${locale}/s/${tenant.slug}` : `/${locale}/dashboard/settings`}
            className="group flex flex-col justify-between gap-6 bg-ink p-5 text-paper transition-colors hover:bg-navy"
          >
            <span className={`${LABEL} text-paper/40`}>{overview.actions.siteTitle}</span>
            <span className="text-sm leading-relaxed text-paper/70">
              {tenant?.slug ? overview.actions.siteBody : overview.actions.siteNoSlug}
            </span>
            <span className="text-[0.66rem] uppercase tracking-[0.16em] text-turquoise">
              {tenant?.slug ? overview.actions.siteCta : overview.actions.siteSettings}
            </span>
          </Link>
        </div>
      </section>

      <dl className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map((figure) => (
          <div key={figure.key} className="bg-white p-5">
            <dt className={`${LABEL} text-ink/40`}>{figure.label}</dt>
            <dd className="mt-2 font-display text-3xl leading-none tabular-nums text-ink">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className={`${LABEL} text-ink/40`}>{overview.upcoming}</h2>
        {rows(upcoming, overview.noneUpcoming)}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={`${LABEL} text-ink/40`}>{overview.recent}</h2>
        {rows(data.recentAppointments ?? [], overview.noneRecent)}
      </section>

      {stats && (
        <section className="flex flex-col gap-3 border-t border-ink/10 pt-8">
          <h2 className={`${LABEL} text-ink/40`}>{overview.countsTitle}</h2>
          <p className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm tabular-nums text-ink/70">
            <span>
              <strong className="font-display text-xl text-ink">{stats.counts.customers}</strong>{" "}
              {overview.countsCustomers}
            </span>
            <span>
              <strong className="font-display text-xl text-ink">{stats.counts.services}</strong>{" "}
              {overview.countsServices}
            </span>
            <span>
              <strong className="font-display text-xl text-ink">{stats.counts.staff}</strong>{" "}
              {overview.countsStaff}
            </span>
            <span>
              <strong className="font-display text-xl text-ink">{stats.counts.gallery}</strong>{" "}
              {overview.countsGallery}
            </span>
          </p>
        </section>
      )}
    </div>
  );
}
