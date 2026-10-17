"use client";

import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useAuditLogs, useAuditLogsByUser } from "@/features/audit/queries";
import type { AuditLog } from "@/features/audit/types";
import { useAccounts } from "@/features/users/queries";
import { LABEL } from "@/lib/editorial";

/**
 * Journal d'audit.
 *
 * Chaque ligne vient de `GET /audit/logs` : action, entité, auteur, IP, agent.
 * L'auteur est un identifiant (`userId`) : les noms sont résolus depuis la liste
 * des comptes, déjà en cache pour l'écran des accès. Sans correspondance, on
 * affiche « — » — jamais un nom supposé.
 *
 * Le filtre par auteur est un vrai choix de route, pas un filtre local : le
 * contrat expose `GET /audit/logs/user/{userId}` à côté de `GET /audit/logs`, et
 * le second ne sait pas filtrer par personne. « Tout le salon » lit donc la
 * première, « une personne » la seconde — l'une ou l'autre, jamais les deux.
 *
 * Il n'y a pas de filtre par action ni par date : le contrat n'expose que
 * `limit`, et une recherche d'historique demandera une route dédiée.
 */
export default function AuditPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.audit;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const [author, setAuthor] = useState("");

  const allQ = useAuditLogs(50);
  const byUserQ = useAuditLogsByUser(author || null, 50);
  const auditQ = author ? byUserQ : allQ;

  const accountsQ = useAccounts();

  const accounts = useMemo(
    () =>
      new Map(
        (accountsQ.data ?? []).map((account) => [
          account.id,
          `${account.firstName} ${account.lastName}`.trim(),
        ]),
      ),
    [accountsQ.data],
  );

  const rows = auditQ.data ?? [];

  const stamp = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(intlLocale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsed);
  };

  const columns: Column<AuditLog>[] = [
    {
      key: "date",
      label: labels.columns.date,
      cell: (log) => <span className="tabular-nums text-xs text-ink/60">{stamp(log.updatedAt)}</span>,
    },
    {
      key: "action",
      label: labels.columns.action,
      cell: (log) => <span className="text-ink">{log.action}</span>,
    },
    {
      key: "entity",
      label: labels.columns.entity,
      cell: (log) => <span className="text-xs text-ink/70">{log.entity}</span>,
    },
    {
      key: "user",
      label: labels.columns.user,
      cell: (log) => (
        <span className="text-xs text-ink/60">
          {log.userId ? (accounts.get(log.userId) ?? "—") : "—"}
        </span>
      ),
    },
    {
      key: "ip",
      label: labels.columns.ip,
      cell: (log) => <span className="tabular-nums text-xs text-ink/45">{log.ip ?? "—"}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.audit} title={labels.title} lead={labels.lead}>
        <label className="mt-2 flex w-full flex-col gap-2 sm:w-64">
          <span className={`${LABEL} text-ink/40`}>{labels.authorLabel}</span>
          <select
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
          >
            <option value="">{labels.allAuthors}</option>
            {(accountsQ.data ?? []).map((account) => (
              <option key={account.id} value={account.id}>
                {`${account.firstName} ${account.lastName}`.trim() || account.email}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>

      {auditQ.isPending && <Loading />}

      {auditQ.isError && <LoadError onRetry={() => auditQ.refetch()} />}

      {auditQ.isSuccess && rows.length === 0 && (
        <Empty title={labels.emptyTitle} body={labels.emptyBody} />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>
          <DataTable columns={columns} rows={rows} rowKey={(log) => log.id} minWidth="44rem" />
        </section>
      )}
    </div>
  );
}
