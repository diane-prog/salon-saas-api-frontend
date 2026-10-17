"use client";

import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useAnalyticsOverview } from "@/features/analytics/queries";
import { LABEL, RULE } from "@/lib/editorial";
import { formatPrice } from "@/lib/price";

/**
 * Statistiques du salon sur une période.
 *
 * Une seule requête (`/analytics/overview`) alimente tout l'écran : chiffre
 * d'affaires, rendez-vous, clientèle, prestations et membres les plus
 * sollicités. `/analytics/revenue` renvoie un sous-ensemble de la même réponse —
 * l'appeler en plus, ce serait deux sources pour les mêmes montants.
 *
 * La période par défaut est le mois en cours. Les bornes sont calculées en UTC,
 * comme partout dans l'espace, pour que le serveur et le navigateur s'accordent
 * au premier rendu.
 */
type Row = { readonly name: string; readonly count: number; readonly revenue: number };

function monthStartUtc(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.analytics;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const [from, setFrom] = useState(monthStartUtc);
  const [to, setTo] = useState(todayUtc);

  const overviewQ = useAnalyticsOverview({ from, to });
  const data = overviewQ.data;

  const money = (value: number | undefined) =>
    value === undefined
      ? labels.noData
      : formatPrice(value, dict.storefront.priceCurrency, intlLocale);

  const percent = (value: number | undefined) =>
    value === undefined ? labels.noData : `${Math.round(value)} %`;

  const columns: Column<Row>[] = useMemo(
    () => [
      { key: "name", label: labels.columns.name, cell: (row) => <span className="text-ink">{row.name}</span> },
      {
        key: "count",
        label: labels.columns.count,
        numeric: true,
        cell: (row) => <span className="text-ink/75">{row.count}</span>,
      },
      {
        key: "revenue",
        label: labels.columns.revenue,
        numeric: true,
        cell: (row) => <span className="text-ink/75">{money(row.revenue)}</span>,
      },
    ],
    // `money` dépend de la locale et du dictionnaire, déjà stables ici.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labels, intlLocale],
  );

  const figures = data
    ? [
        { label: labels.revenue, value: money(data.revenue?.total) },
        { label: labels.averageTicket, value: money(data.revenue?.average) },
        { label: labels.appointments, value: data.appointments?.total ?? 0 },
        { label: labels.completed, value: data.appointments?.completed ?? 0 },
        { label: labels.cancelled, value: data.appointments?.cancelled ?? 0 },
        { label: labels.clients, value: data.customers?.total ?? 0 },
        { label: labels.newClients, value: data.customers?.new ?? 0 },
        { label: labels.retention, value: percent(data.customers?.retentionRate) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.analytics} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex flex-col gap-2">
            <span className={`${LABEL} text-ink/40`}>{labels.from}</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={`${LABEL} text-ink/40`}>{labels.to}</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </label>
        </div>
      </PageHeader>

      {overviewQ.isPending && <Loading />}

      {overviewQ.isError && <LoadError onRetry={() => overviewQ.refetch()} />}

      {data && (
        <>
          <dl className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {figures.map((figure) => (
              <div key={figure.label} className="bg-white p-5">
                <dt className={`${LABEL} text-ink/40`}>{figure.label}</dt>
                <dd className="mt-2 font-light text-2xl tabular-nums text-ink">{figure.value}</dd>
              </div>
            ))}
          </dl>

          {data.popularServices?.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className={`${LABEL} text-ink/40`}>{labels.topServices}</h2>
              <DataTable
                columns={columns}
                rows={data.popularServices}
                rowKey={(row) => row.name}
                minWidth="32rem"
              />
            </section>
          )}

          {data.topStaff?.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className={`${LABEL} text-ink/40`}>{labels.topStaff}</h2>
              <DataTable
                columns={columns}
                rows={data.topStaff}
                rowKey={(row) => row.name}
                minWidth="32rem"
              />
            </section>
          )}

          {data.revenue?.byDay?.length > 0 && (
            <section className={`border bg-white ${RULE}`}>
              <h2 className={`${LABEL} border-b px-5 py-4 text-ink/40 ${RULE}`}>{labels.byDay}</h2>
              <ul>
                {data.revenue.byDay.map((entry) => (
                  <li
                    key={entry.date}
                    className="flex items-baseline justify-between gap-4 border-b border-navy/[0.06] px-5 py-2.5 text-sm last:border-0"
                  >
                    <span className="tabular-nums text-ink/60">{entry.date}</span>
                    <span className="tabular-nums text-ink/80">{money(entry.revenue)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
