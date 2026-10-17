"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import {
  useCurrentSubscription,
  useSubscriptionHistory,
  useSubscriptionPlans,
} from "@/features/billing/queries";
import type { PlanLimits, Subscription } from "@/features/billing/types";
import { useTenant } from "@/features/tenant/queries";
import { LABEL, RULE } from "@/lib/editorial";
import { formatPrice } from "@/lib/price";

/**
 * Abonnement du salon.
 *
 * TROIS LECTURES, ET C'EST LE CONTRAT QUI L'IMPOSE (mesuré le 2026-10-17) :
 *   - `/tenant/me`          → le forfait du salon (`subscriptionPlan`) ;
 *   - `/subscriptions/history` → le statut, les dates et le montant facturé ;
 *   - `/subscriptions/plans`   → le prix catalogue et les quotas du forfait.
 *
 * `/subscriptions/current` ne renvoie que `{ limits }` (souvent vide) — l'écran
 * l'utilise donc pour afficher les limites RÉELLES quand le serveur en donne,
 * et retombe sur celles du forfait sinon. Il ne cherche jamais un plan ou une
 * date là où il n'y en a pas : c'est ce qui produisait « undefined € ».
 *
 * Toujours aucun achat : le contrat n'expose ni checkout ni changement de
 * forfait, et la note du bas le dit.
 */
export default function BillingPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.billing;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const tenantQ = useTenant();
  const historyQ = useSubscriptionHistory();
  const plansQ = useSubscriptionPlans();
  const currentQ = useCurrentSubscription();

  const history = historyQ.data ?? [];
  const latest = history[0];
  const plan = tenantQ.data?.subscriptionPlan ?? latest?.plan;
  const planInfo = plansQ.data?.find((entry) => entry.plan === plan);

  const day = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(parsed);
  };

  const price = (value: number | string | undefined) =>
    value === undefined || value === null ? "—" : formatPrice(value, dict.storefront.priceCurrency, intlLocale);

  /** `-1` signifie « illimité » dans les quotas du backend. */
  const quota = (value: number | undefined) =>
    value === undefined ? "—" : value < 0 ? labels.unlimited : String(value);

  const limits: Partial<PlanLimits> = currentQ.data?.limits ?? planInfo?.limits ?? {};
  const hasLimits = Object.values(limits).some((value) => value !== undefined);

  const columns: Column<Subscription>[] = [
    {
      key: "plan",
      label: labels.columns.plan,
      cell: (row) => <span className="text-ink">{row.plan}</span>,
    },
    {
      key: "status",
      label: labels.columns.status,
      cell: (row) => <span className="text-xs text-ink/60">{labels.statuses[row.status]}</span>,
    },
    {
      key: "start",
      label: labels.columns.start,
      cell: (row) => <span className="text-xs text-ink/60">{day(row.startDate)}</span>,
    },
    {
      key: "end",
      label: labels.columns.end,
      cell: (row) => <span className="text-xs text-ink/60">{day(row.endDate)}</span>,
    },
    {
      key: "price",
      label: labels.columns.price,
      numeric: true,
      cell: (row) => <span className="text-ink/75">{price(row.priceMonthly)}</span>,
    },
  ];

  const loading = tenantQ.isPending || (historyQ.isPending && plansQ.isPending);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.billing} title={labels.title} lead={labels.lead}>
        <p className="mt-1 text-xs text-ink/40">{labels.note}</p>
      </PageHeader>

      {loading && <Loading />}

      {tenantQ.isError && <LoadError onRetry={() => tenantQ.refetch()} />}

      {!loading && !tenantQ.isError && !plan && (
        <Empty title={labels.emptyTitle} body={labels.emptyBody} />
      )}

      {plan && (
        <section className={`border bg-white ${RULE}`}>
          <div className={`flex flex-wrap items-baseline justify-between gap-3 border-b px-6 py-4 ${RULE}`}>
            <span className={`${LABEL} text-ink/40`}>{labels.current}</span>
            {latest && (
              <span
                className={`border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] ${
                  latest.status === "ACTIVE"
                    ? "border-brand/30 text-brand"
                    : latest.status === "TRIAL"
                      ? "border-orange/30 text-orange"
                      : "border-ink/15 text-ink/50"
                }`}
              >
                {labels.statuses[latest.status]}
              </span>
            )}
          </div>

          <dl className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-5">
              <dt className={`${LABEL} text-ink/40`}>{labels.fields.plan}</dt>
              <dd className="mt-2 font-light text-2xl text-ink">{plan}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className={`${LABEL} text-ink/40`}>{labels.fields.price}</dt>
              <dd className="mt-2 font-light text-2xl tabular-nums text-ink">
                {price(planInfo?.priceMonthly ?? latest?.priceMonthly)}
              </dd>
            </div>
            <div className="bg-white p-5">
              <dt className={`${LABEL} text-ink/40`}>{labels.fields.start}</dt>
              <dd className="mt-2 text-sm text-ink/75">{day(latest?.startDate)}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className={`${LABEL} text-ink/40`}>
                {latest?.trialEndDate ? labels.fields.trial : labels.fields.end}
              </dt>
              <dd className="mt-2 text-sm text-ink/75">
                {day(latest?.trialEndDate ?? latest?.endDate)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {hasLimits && (
        <section className="flex flex-col gap-3">
          <h2 className={`${LABEL} text-ink/40`}>{labels.limits.title}</h2>
          <dl className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "maxCustomers", label: labels.limits.customers, value: limits.maxCustomers },
              { key: "maxStaff", label: labels.limits.staff, value: limits.maxStaff },
              { key: "maxGalleryImages", label: labels.limits.gallery, value: limits.maxGalleryImages },
              {
                key: "maxAppointmentsPerMonth",
                label: labels.limits.appointments,
                value: limits.maxAppointmentsPerMonth,
              },
            ].map((entry) => (
              <div key={entry.key} className="bg-white p-5">
                <dt className={`${LABEL} text-ink/40`}>{entry.label}</dt>
                <dd className="mt-2 font-light text-xl tabular-nums text-ink">{quota(entry.value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className={`${LABEL} text-ink/40`}>{labels.history}</h2>

        {historyQ.isPending && <Loading />}

        {historyQ.isError && <LoadError onRetry={() => historyQ.refetch()} />}

        {historyQ.isSuccess && history.length === 0 && (
          <p className="text-sm text-ink/50">{labels.emptyBody}</p>
        )}

        {history.length > 0 && (
          <DataTable
            columns={columns}
            rows={history}
            rowKey={(row, index) => `${row.plan}-${row.startDate}-${index}`}
          />
        )}
      </section>
    </div>
  );
}
