"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import AccountSheet from "@/components/workspace/AccountSheet";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import type { Account } from "@/features/users/types";
import {
  useAccounts,
  useCurrentAccount,
  useDeleteAccount,
} from "@/features/users/queries";
import { LABEL } from "@/lib/editorial";

/**
 * Comptes et accès.
 *
 * Ce que l'écran montre est exactement ce que `/users` renvoie : qui peut se
 * connecter au salon, avec quel rôle, et quand la personne s'est connectée pour
 * la dernière fois. `/users/me` sert uniquement à marquer la ligne « vous » —
 * deux sources pour deux informations différentes, jamais deux fois la même.
 *
 * L'ouverture d'un accès passe par une feuille dédiée, avec un choix de rôle
 * explicite. La suppression d'un compte n'est pas proposée sur sa propre ligne :
 * se retirer soi-même l'accès depuis l'écran qu'on est en train d'utiliser est
 * une erreur qu'on ne rattrape pas sans le propriétaire du salon.
 */
export default function TeamPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.accounts;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const accountsQ = useAccounts();
  const meQ = useCurrentAccount();
  const remove = useDeleteAccount();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const rows = accountsQ.data ?? [];
  const meId = meQ.data?.id;

  const date = (value?: string | null) => {
    if (!value) return labels.neverLoggedIn;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return labels.neverLoggedIn;
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(parsed);
  };

  const columns: Column<Account>[] = [
    {
      key: "name",
      label: labels.columns.name,
      cell: (account) => (
        <span className="text-ink">
          {account.firstName} {account.lastName}
          {account.id === meId && (
            <span className={`${LABEL} ml-2 text-ink/35`}>{labels.you}</span>
          )}
          <span className="mt-1 block text-xs text-ink/45">{account.email}</span>
        </span>
      ),
    },
    {
      key: "role",
      label: labels.columns.role,
      cell: (account) => (
        <span className="text-xs text-ink/70">{labels.roles[account.role] ?? account.role}</span>
      ),
    },
    {
      key: "lastLogin",
      label: labels.columns.lastLogin,
      cell: (account) => (
        <span className="text-xs text-ink/55">{date(account.lastLoginAt)}</span>
      ),
    },
    {
      key: "state",
      label: labels.columns.state,
      cell: (account) => (
        <span className={account.active ? "text-xs text-ink/70" : "text-xs text-ink/35"}>
          {account.active ? labels.active : labels.inactive}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      cell: (account) => (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setEditing(account);
              setSheetOpen(true);
            }}
            className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {labels.edit}
          </button>

          {account.id !== meId && (
            <ConfirmButton
              label={labels.remove}
              question={labels.removeQuestion}
              busyLabel={labels.removeBusy}
              onConfirm={() => remove.mutateAsync(account.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.team} title={labels.title} lead={labels.lead}>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
          >
            {labels.add}
          </button>
        </div>
      </PageHeader>

      {accountsQ.isPending && <Loading />}

      {accountsQ.isError && <LoadError onRetry={() => accountsQ.refetch()} />}

      {accountsQ.isSuccess && rows.length === 0 && (
        <Empty
          title={labels.emptyTitle}
          body={labels.emptyBody}
          action={{
            label: labels.add,
            onClick: () => {
              setEditing(null);
              setSheetOpen(true);
            },
          }}
        />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>
          <DataTable columns={columns} rows={rows} rowKey={(account) => account.id} minWidth="48rem" />
        </section>
      )}

      <AccountSheet open={sheetOpen} onOpenChange={setSheetOpen} account={editing} />
    </div>
  );
}
