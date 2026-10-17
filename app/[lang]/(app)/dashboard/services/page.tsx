"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import ServiceSheet from "@/components/workspace/ServiceSheet";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { formatPrice } from "@/lib/price";
import {
  useDeleteSalonServiceItem,
  useSalonServiceItems,
} from "@/features/salon-services/queries";
import type { SalonServiceItem } from "@/features/salon-services/types";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Le catalogue du salon, tel qu'il est publié.
 *
 * Deux colonnes disent ce que la vitrine fera de chaque ligne : « En ligne »
 * (`bookableOnline`) et « État » (`active`). Une prestation inactive reste au
 * catalogue mais ne s'affiche plus ; une prestation non réservable en ligne
 * existe pour le comptoir seulement. C'est exactement ce que l'API renvoie —
 * rien n'est recalculé ici.
 *
 * La même feuille sert aux deux gestes : création quand `editing` est `null`,
 * modification quand il porte une prestation. Les colonnes ne changent pas —
 * on modifie une ligne depuis la liste qui l'affiche.
 */
export default function ServicesPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.services;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const servicesQ = useSalonServiceItems();
  const remove = useDeleteSalonServiceItem();
  const rows = servicesQ.data ?? [];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SalonServiceItem | null>(null);

  const columns = [
    labels.columns.name,
    labels.columns.category,
    labels.columns.duration,
    labels.columns.price,
    labels.columns.online,
    labels.columns.state,
    "",
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.services} title={labels.title} lead={labels.lead}>
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

      {servicesQ.isPending && <Loading />}

      {servicesQ.isError && <LoadError onRetry={() => servicesQ.refetch()} />}

      {servicesQ.isSuccess && rows.length === 0 && (
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

          <div className={`overflow-x-auto border bg-white ${RULE}`}>
            <table className="w-full min-w-[42rem] text-left text-sm">
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
                {rows.map((service) => (
                  <tr key={service.id} className="border-b border-navy/[0.06] last:border-0">
                    <td className="px-4 py-3 text-ink">
                      {service.name}
                      {service.description && (
                        <span className="mt-1 block max-w-sm text-xs leading-relaxed text-ink/45">
                          {service.description}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-ink/60">{service.category ?? "—"}</td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">
                      {service.durationMinutes} min
                    </td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">
                      {formatPrice(service.price, dict.storefront.priceCurrency, intlLocale)}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span
                        className={
                          service.bookableOnline ? "text-brand" : "text-ink/45"
                        }
                      >
                        {service.bookableOnline ? labels.online : labels.inPerson}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className={service.active ? "text-ink/70" : "text-ink/35"}>
                        {service.active ? labels.active : labels.inactive}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(service);
                            setSheetOpen(true);
                          }}
                          className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
                        >
                          {labels.edit}
                        </button>

                        <ConfirmButton
                          label={labels.remove}
                          question={labels.removeQuestion}
                          busyLabel={labels.removeBusy}
                          onConfirm={() => remove.mutateAsync(service.id)}
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

      <ServiceSheet open={sheetOpen} onOpenChange={setSheetOpen} service={editing} />
    </div>
  );
}
