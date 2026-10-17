"use client";

import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useAuditLogs, useAuditLogsByUser } from "@/features/audit/queries";
import type { AuditLog } from "@/features/audit/types";
import { useAccounts } from "@/features/users/queries";
import { familyOf, type AuditFamily } from "@/lib/audit-family";
import { LABEL } from "@/lib/editorial";

/**
 * Journal d'audit — lu comme un PIPELINE, pas comme un tableau.
 *
 * POURQUOI CETTE FORME : un journal est une SUITE. La table disait la même chose, mais
 * ligne par ligne sans direction : on ne voyait ni l'ordre des journées, ni le rythme
 * (« sept actions en dix minutes »), ni ce qui précède quoi. Ici chaque entrée est une
 * ÉTAPE sur un rail continu, et son contenu se lit de gauche à droite comme un flux :
 * **qui → a fait quoi → sur quoi**. Le rail ne s'interrompt pas d'une entrée à l'autre,
 * et les journées sont des chapitres, pas des groupes de lignes.
 *
 * Le RYTHME est affiché : entre deux étapes consécutives, l'écart en minutes apparaît
 * dans la gouttière. Un trou de trois heures et une rafale de dix actions ne se lisent
 * pas pareil, et c'est justement ce qu'un tableau ne montrait pas.
 *
 * CE QUI EST RÉEL, ET CE QUI EST DÉDUIT : tout vient de `GET /audit/logs` (ou de
 * `GET /audit/logs/user/{id}`, voir plus bas). En revanche, la FAMILLE d'une action (création,
 * modification, suppression, session) n'est pas un champ de l'API : elle est déduite du texte
 * de `action` par `lib/audit-family.ts`. C'est une lecture de confort, jamais une donnée
 * inventée — l'action brute est TOUJOURS affichée telle quelle à côté du libellé de famille,
 * parce que c'est elle qui fait foi.
 *
 * L'auteur est un identifiant (`userId`) : les noms sont résolus depuis la liste des comptes,
 * déjà en cache pour l'écran des accès. Sans correspondance, on affiche « — », et une action
 * sans `userId` (tâche de fond, appel machine) s'affiche sans auteur — pas comme un inconnu.
 *
 * Le filtre par personne est un vrai choix de ROUTE, pas un filtre local : le contrat expose
 * `GET /audit/logs/user/{userId}` à côté de `GET /audit/logs`, et le second ne sait pas filtrer
 * par personne. « Tout le salon » lit donc la première, « une personne » la seconde — l'une ou
 * l'autre, jamais les deux. Il n'y a pas de filtre par action ni par date : le contrat n'expose
 * que `limit`, et une recherche d'historique demandera une route dédiée.
 */

/** La couleur du nœud, par famille. La famille elle-même vient de `lib/audit-family.ts`. */
const TONE: Record<AuditFamily, string> = {
  create: "bg-brand",
  update: "bg-ink/40",
  delete: "bg-destructive",
  session: "bg-turquoise",
  other: "bg-ink/20",
};

/** Jour local d'une date, en `AAAA-MM-JJ` — la clé de regroupement, et la comparaison. */
function keyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Jour local d'une entrée. Une entrée sans date lisible a sa propre section « — ». */
function dayKey(log: AuditLog): string {
  const raw = log.updatedAt ?? log.createdAt;
  const date = raw ? new Date(raw) : new Date(NaN);
  return Number.isNaN(date.getTime()) ? "unknown" : keyOf(date);
}

/** Horodatage en millisecondes, ou `null` si la date est absente/illisible. */
function stampMs(log: AuditLog): number | null {
  const raw = log.updatedAt ?? log.createdAt;
  const parsed = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Écart, en minutes, entre l'étape `newer` et l'étape `older`.
 *
 * `null` quand l'une des deux dates manque : on ne comble pas un trou par un zéro, qui se
 * lirait comme « à la même seconde ». Le seuil d'affichage (5 min) est dans le rendu : en
 * dessous, l'écart n'apprend rien et hacherait le rail.
 */
function gapMinutes(newer: AuditLog, older: AuditLog): number | null {
  const end = stampMs(newer);
  const start = stampMs(older);
  if (end === null || start === null) return null;
  const diff = Math.round((end - start) / 60000);
  return diff > 0 ? diff : null;
}

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
    () => new Map((accountsQ.data ?? []).map((account) => [account.id, account])),
    [accountsQ.data],
  );

  const name = (id?: string | null) => {
    if (!id) return null;
    const account = accounts.get(id);
    if (!account) return "—";
    return `${account.firstName} ${account.lastName}`.trim() || account.email;
  };

  const initials = (id?: string | null) => {
    const label = name(id);
    if (!label || label === "—") return "—";
    return label
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  };

  /* Le plus récent en haut. Le tri est fait CÔTÉ ÉCRAN parce que le contrat ne documente
     aucun ordre : le supposer serait parier sur une convention non écrite. */
  const rows = useMemo(() => {
    const list = [...(auditQ.data ?? [])];
    return list.sort((a, b) => (stampMs(b) ?? 0) - (stampMs(a) ?? 0));
  }, [auditQ.data]);

  /* Les entrées, déjà rangées par journée. `Map` garde l'ordre d'insertion : puisque la liste
     est triée du plus récent au plus ancien, les journées sortent dans le bon sens sans
     second tri. */
  const days = useMemo(() => {
    const map = new Map<string, AuditLog[]>();
    for (const log of rows) {
      const key = dayKey(log);
      const bucket = map.get(key);
      if (bucket) bucket.push(log);
      else map.set(key, [log]);
    }
    return [...map.entries()];
  }, [rows]);

  const time = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(intlLocale, { timeStyle: "short" }).format(parsed);
  };

  const dayLabel = (key: string) => {
    if (key === "unknown") return "—";

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (key === keyOf(now)) return labels.today;
    if (key === keyOf(yesterday)) return labels.yesterday;

    const [year, month, day] = key.split("-").map(Number);
    const isThisYear = year === now.getFullYear();
    return new Intl.DateTimeFormat(intlLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      ...(isThisYear ? {} : { year: "numeric" }),
    }).format(new Date(year, month - 1, day));
  };

  const stamp = (log: AuditLog) => time(log.updatedAt ?? log.createdAt);

  const first = rows.length > 0 ? rows[rows.length - 1] : undefined;
  const last = rows[0];
  const authors = new Set(rows.map((log) => log.userId ?? "machine"));

  const period = (log?: AuditLog) => {
    const raw = log?.updatedAt ?? log?.createdAt;
    if (!raw) return "—";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: "short", timeStyle: "short" }).format(
      parsed,
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.audit} title={labels.title} lead={labels.lead}>
        {/* ——— Filtre par personne : une pastille par auteur. Un menu déroulant cachait la
                question (« qui agit ici ? ») ; les pastilles la montrent, et disent du même
                coup combien de personnes ont laissé une trace. */}
        <div className="flex flex-col items-end gap-2">
          <span className={`${LABEL} text-ink/40`}>{labels.authorLabel}</span>
          <div className="flex max-w-full flex-wrap justify-end gap-1">
            <button
              type="button"
              onClick={() => setAuthor("")}
              aria-pressed={author === ""}
              className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                author === ""
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 text-ink/60 hover:border-ink/40 hover:text-ink"
              }`}
            >
              {labels.allAuthors}
            </button>

            {(accountsQ.data ?? []).map((account) => {
              const id = account.id;
              const active = author === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAuthor(active ? "" : id)}
                  aria-pressed={active}
                  className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 text-ink/60 hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {`${account.firstName} ${account.lastName}`.trim() || account.email}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      {auditQ.isPending && <Loading />}

      {auditQ.isError && <LoadError onRetry={() => auditQ.refetch()} />}

      {auditQ.isSuccess && rows.length === 0 && (
        <Empty
          title={labels.emptyTitle}
          body={labels.emptyBody}
          action={author ? { label: labels.allAuthors, onClick: () => setAuthor("") } : undefined}
        />
      )}

      {rows.length > 0 && (
        <>
          {/* ——— Bandeau de tête : combien d'actions, sur quelle période, par combien de
                  personnes, et la légende des couleurs du rail. Quatre lectures, une ligne. */}
          <dl className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-4">
              <dt className={`${LABEL} text-ink/40`}>{labels.count}</dt>
              <dd className="mt-2 font-display text-2xl leading-none tabular-nums text-ink">
                {rows.length}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className={`${LABEL} text-ink/40`}>{labels.periodLabel}</dt>
              <dd className="mt-2 text-xs leading-relaxed tabular-nums text-ink/70">
                {period(first)}
                <span className="mx-1 text-ink/30">→</span>
                {period(last)}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className={`${LABEL} text-ink/40`}>{labels.authorsLabel}</dt>
              <dd className="mt-2 font-display text-2xl leading-none tabular-nums text-ink">
                {authors.size}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className={`${LABEL} text-ink/40`}>{labels.legend}</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-ink/55">
                {(["create", "update", "delete", "session"] as const).map((family) => (
                  <span key={family} className="flex items-center gap-1.5">
                    <span aria-hidden className={`h-2 w-2 ${TONE[family]}`} />
                    {labels.families[family]}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          {/* ——— Le pipeline : un rail qui descend, des étapes, des journées. */}
          <div className="flex flex-col gap-12">
            {days.map(([key, entries]) => (
              <section key={key} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
                  <h2 className="font-display text-lg leading-none text-ink first-letter:uppercase">
                    {dayLabel(key)}
                  </h2>
                  <span className={`${LABEL} text-ink/35`}>
                    {entries.length} {labels.count}
                  </span>
                </div>

                {/* La légende du flux : les trois temps d'une étape, nommés une fois, avec
                    les intitulés du contrat (`columns`). Elle disparaît sur téléphone, où le
                    flux passe à la ligne et n'a plus de colonnes à annoncer. */}
                <div className="hidden grid-cols-[4.5rem_1.25rem_minmax(0,1fr)] gap-x-3 sm:grid">
                  <span className={`${LABEL} pt-1 text-right text-ink/30`}>
                    {labels.columns.date}
                  </span>
                  <span />
                  <span className={`${LABEL} flex flex-wrap items-center gap-x-2 gap-y-1 text-ink/30`}>
                    {labels.columns.user}
                    <span aria-hidden className="text-ink/20">→</span>
                    {labels.columns.action}
                    <span aria-hidden className="text-ink/20">→</span>
                    {labels.columns.entity}
                  </span>
                </div>

                <ol className="flex flex-col">
                  {entries.map((log, index) => {
                    const family = familyOf(log.action);
                    const actor = name(log.userId);
                    const older = entries[index + 1];
                    const gap = older ? gapMinutes(log, older) : null;

                    return (
                      <li
                        key={log.id}
                        className="grid grid-cols-[3.25rem_1.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[4.5rem_1.25rem_minmax(0,1fr)]"
                      >
                        {/* La gouttière : l'heure, puis l'écart avec l'étape suivante — le
                            rythme du journal, que le tableau ne disait pas. */}
                        <div className="flex flex-col items-end pt-2">
                          <time className="text-[0.72rem] leading-none tabular-nums text-ink/55">
                            {stamp(log)}
                          </time>
                          {gap !== null && gap >= 5 && (
                            <span className="mt-2.5 text-[0.58rem] uppercase tracking-[0.06em] tabular-nums text-ink/25">
                              +{gap} min
                            </span>
                          )}
                        </div>

                        {/* Le rail : un filet continu par rangée, et le nœud de l'étape.
                            `ring-paper` creuse un vide autour du nœud : le filet ne le
                            traverse pas, il s'y arrête. */}
                        <div className="relative flex justify-center">
                          <span aria-hidden className="absolute inset-y-0 w-px bg-ink/10" />
                          <span
                            aria-hidden
                            className={`relative mt-2 h-2.5 w-2.5 rounded-full ring-[3px] ring-paper ${TONE[family]}`}
                          />
                        </div>

                        {/* L'étape elle-même : une carte, lue de gauche à droite. */}
                        <div className="min-w-0 pb-6">
                          <div className="border border-ink/10 bg-white px-4 py-3 transition-colors hover:border-ink/25">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <span className={`${LABEL} flex items-center gap-1.5 text-ink/45`}>
                                <span aria-hidden className={`h-1.5 w-1.5 ${TONE[family]}`} />
                                {labels.families[family]}
                              </span>

                              {/* La famille est une LECTURE ; l'action brute, affichée juste
                                  en dessous, est la donnée. On ne la remplace jamais. */}
                              {(log.ip || log.userAgent) && (
                                <details className="group">
                                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-ink/30 transition-colors hover:text-ink/60 [&::-webkit-details-marker]:hidden">
                                    <span
                                      aria-hidden
                                      className="text-[0.75rem] leading-none transition-transform group-open:rotate-90"
                                    >
                                      ›
                                    </span>
                                    {labels.agentLabel}
                                    {log.ip && (
                                      <span className="normal-case tracking-normal tabular-nums text-ink/40">
                                        · {log.ip}
                                      </span>
                                    )}
                                  </summary>
                                  {log.userAgent && (
                                    <p className="mt-1.5 max-w-md break-all text-[0.66rem] leading-relaxed text-ink/35">
                                      {log.userAgent}
                                    </p>
                                  )}
                                </details>
                              )}
                            </div>

                            {/* Le flux : qui → quoi → sur quoi. */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                              {actor ? (
                                <span className="inline-flex items-center gap-2 border border-ink/12 bg-paper/70 py-1 pl-1 pr-2.5">
                                  <span
                                    aria-hidden
                                    className="grid h-5 w-5 place-items-center bg-ink/[0.06] text-[0.55rem] tracking-tight text-ink/60"
                                  >
                                    {initials(log.userId)}
                                  </span>
                                  <span className="text-[0.78rem] leading-none text-ink/80">
                                    {actor}
                                  </span>
                                </span>
                              ) : (
                                /* Pas d'auteur enregistré : c'est le cas d'un appel machine
                                   (tâche planifiée, webhook). On le dit, plutôt que d'afficher
                                   un tiret qui laisserait croire à une donnée manquante. */
                                <span className="border border-dashed border-ink/15 px-2.5 py-1 text-[0.72rem] leading-none text-ink/45">
                                  {labels.machine}
                                </span>
                              )}

                              <span aria-hidden className="text-[0.8rem] text-ink/25">
                                →
                              </span>

                              <span className="font-display text-[1.02rem] leading-snug text-ink">
                                {log.action}
                              </span>

                              <span aria-hidden className="text-[0.8rem] text-ink/25">
                                →
                              </span>

                              <span className="min-w-0 text-[0.78rem] leading-snug text-ink/70">
                                {log.entity}
                                {log.entityId && (
                                  <span className="ml-1.5 break-all text-[0.64rem] tabular-nums text-ink/35">
                                    {log.entityId.slice(0, 8)}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
