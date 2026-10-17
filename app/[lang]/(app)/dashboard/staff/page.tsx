"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import AvailabilitySheet from "@/components/workspace/AvailabilitySheet";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import StaffSheet from "@/components/workspace/StaffSheet";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useDeleteStaffMember, useStaffMembers } from "@/features/staff/queries";
import type { StaffMember } from "@/features/staff/types";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * L'équipe du salon.
 *
 * `commissionRate` arrive tantôt en nombre, tantôt en chaîne (`"40.00"`) selon le
 * chemin — il est affiché après conversion, et « — » quand il n'est pas fourni.
 * Aucune commission n'est recalculée ici : c'est le taux du contrat, pas un
 * montant gagné.
 *
 * Deux feuilles, deux gestes qui n'ont rien à voir : la fiche (qui est cette
 * personne) et les disponibilités (quand travaille-t-elle). Les fondre dans un
 * seul formulaire obligerait à charger une semaine pour changer un prénom.
 */
export default function StaffPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.staff;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const staffQ = useStaffMembers();
  const remove = useDeleteStaffMember();
  const rows = staffQ.data ?? [];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availableFor, setAvailableFor] = useState<StaffMember | null>(null);

  const columns = [
    labels.columns.name,
    labels.columns.role,
    labels.columns.specialties,
    labels.columns.commission,
    labels.columns.state,
    "",
  ];

  const commission = (value: number | string | undefined) => {
    if (value === undefined || value === null || value === "") return "—";
    const rate = Number(value);
    if (!Number.isFinite(rate)) return "—";
    return `${new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 }).format(rate)} %`;
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.staff} title={labels.title} lead={labels.lead}>
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

      {staffQ.isPending && <Loading />}

      {staffQ.isError && <LoadError onRetry={() => staffQ.refetch()} />}

      {staffQ.isSuccess && rows.length === 0 && (
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
            <table className="w-full min-w-[40rem] text-left text-sm">
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
                {rows.map((member) => (
                  <tr key={member.id} className="border-b border-navy/[0.06] last:border-0">
                    <td className="px-4 py-3 text-ink">
                      {member.firstName} {member.lastName}
                      {member.email && (
                        <span className="mt-1 block text-xs text-ink/45">{member.email}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-ink/75">{member.title ?? "—"}</td>

                    <td className="px-4 py-3 text-xs text-ink/50">
                      {member.specialties && member.specialties.length > 0
                        ? member.specialties.join(" · ")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-ink/75">
                      {commission(member.commissionRate)}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className={member.active ? "text-ink/70" : "text-ink/35"}>
                        {member.active ? labels.active : labels.inactive}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(member);
                          setSheetOpen(true);
                        }}
                        className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
                      >
                        {labels.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvailableFor(member);
                          setAvailabilityOpen(true);
                        }}
                        className="ml-4 text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
                      >
                        {labels.availability}
                      </button>

                      <span className="ml-4 inline-flex">
                        <ConfirmButton
                          label={labels.remove}
                          question={labels.removeQuestion}
                          busyLabel={labels.removeBusy}
                          onConfirm={() => remove.mutateAsync(member.id)}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <StaffSheet open={sheetOpen} onOpenChange={setSheetOpen} member={editing} />
      <AvailabilitySheet
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        member={availableFor}
      />
    </div>
  );
}
