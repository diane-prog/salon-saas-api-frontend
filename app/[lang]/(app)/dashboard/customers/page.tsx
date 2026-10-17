"use client";

import { useEffect, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import CustomerSheet from "@/components/workspace/CustomerSheet";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useCustomers, useDeleteCustomer } from "@/features/customers/queries";
import type { Customer } from "@/features/customers/types";
import { formatPrice } from "@/lib/price";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Le fichier client du salon.
 *
 * La recherche est faite PAR LE SERVEUR (`?search=`), pas dans le navigateur :
 * rapatrier toute la base pour filtrer localement serait confortable ici et
 * intenable à trois cents fiches. La frappe est donc différée de 300 ms — le
 * temps de finir un mot, pas une requête par lettre.
 *
 * Les montants (`totalSpent`) passent par `formatPrice` : l'API les sérialise
 * comme les prix, tantôt nombres, tantôt chaînes décimales.
 */
export default function CustomersPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.customers;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  /* La feuille sert aux deux gestes : création (`editing = null`) et modification. */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);;

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const customersQ = useCustomers({ search: debounced || undefined });
  const remove = useDeleteCustomer();
  const rows = customersQ.data ?? [];

  const columns = [
    labels.columns.name,
    labels.columns.phone,
    labels.columns.email,
    labels.columns.visits,
    labels.columns.spent,
    labels.columns.source,
    "",
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.customers} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="flex w-full flex-col gap-2 sm:max-w-sm">
            <span className={`${LABEL} text-ink/40`}>{labels.searchLabel}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand"
            />
          </label>

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

      {customersQ.isPending && <Loading />}

      {customersQ.isError && <LoadError onRetry={() => customersQ.refetch()} />}

      {customersQ.isSuccess && rows.length === 0 && (
        <Empty
          title={debounced ? labels.noResultsTitle : labels.emptyTitle}
          body={debounced ? labels.noResultsBody : labels.emptyBody}
          action={
            debounced
              ? undefined
              : {
                  label: labels.add,
                  onClick: () => {
                    setEditing(null);
                    setSheetOpen(true);
                  },
                }
          }
        />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>

          <div className={`overflow-x-auto border bg-white ${RULE}`}>
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead>
                <tr className={`border-b ${RULE}`}>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className={`${LABEL} px-4 py-3 font-medium text-ink/40`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((customer) => (
                  <tr key={customer.id} className="border-b border-navy/[0.06] last:border-0">
                    <td className="px-4 py-3 text-ink">
                      {customer.firstName} {customer.lastName}
                      {customer.tags && customer.tags.length > 0 && (
                        <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.12em] text-ink/35">
                          {customer.tags.join(" · ")}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">{customer.phone ?? "—"}</td>

                    <td className="px-4 py-3 text-ink/60">{customer.email ?? "—"}</td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">{customer.totalVisits}</td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">
                      {formatPrice(customer.totalSpent, dict.storefront.priceCurrency, intlLocale)}
                    </td>

                    <td className="px-4 py-3 text-xs text-ink/50">
                      {customer.source ? labels.sources[customer.source] : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(customer);
                            setSheetOpen(true);
                          }}
                          className="border border-ink/15 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink"
                        >
                          {labels.edit}
                        </button>

                        <ConfirmButton
                          label={labels.remove}
                          question={labels.removeQuestion}
                          busyLabel={labels.removeBusy}
                          onConfirm={() => remove.mutateAsync(customer.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <CustomerSheet open={sheetOpen} onOpenChange={setSheetOpen} customer={editing} />
    </div>
  );
}
