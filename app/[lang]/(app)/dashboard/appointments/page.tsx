"use client";

import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import AppointmentSheet from "@/components/workspace/AppointmentSheet";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import {
  useAppointments,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/features/appointments/queries";
import type { Appointment, AppointmentStatus } from "@/features/appointments/types";
import { apiErrorMessage } from "@/lib/api-error";
import { useCustomers } from "@/features/customers/queries";
import { formatPrice } from "@/lib/price";
import { useSalonServiceItems } from "@/features/salon-services/queries";
import { useStaffMembers } from "@/features/staff/queries";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * L'agenda du jour — premier écran de données de l'espace salon.
 *
 * Une seule question : « qu'est-ce qui se passe ce jour-là ? ». La date est un
 * filtre, pas une pagination : on choisit un jour, l'API rend ses rendez-vous.
 *
 * LES NOMS VIENNENT DE TROIS AUTRES LISTES, et c'est assumé : `AppointmentEntity`
 * ne transporte que des identifiants (`customerId`, `serviceId`, `staffId`). Les
 * listes clients / prestations / équipe sont donc lues avec leurs propres clés de
 * cache, partagées avec les autres écrans. Un identifiant sans correspondance
 * s'affiche « cliente inconnue » ou « prestation supprimée » — jamais un nom
 * inventé, jamais un vide.
 *
 * Le jour par défaut est calculé en UTC : le serveur et le navigateur tombent donc
 * sur la même date au premier rendu (une date locale décalerait l'hydratation).
 *
 * TROIS ÉCRITURES, ET ELLES NE SE CONFONDENT PAS : changer un statut (annuler un
 * rendez-vous en gardant sa trace), le replanifier (même rendez-vous, autre
 * heure ou autre membre), le supprimer (l'effacer). La suppression est donc
 * confirmée, alors que les deux autres sont réversibles ou traçables.
 */
const STATUS_TONE: Record<AppointmentStatus, string> = {
  PENDING: "border-orange/30 text-orange",
  CONFIRMED: "border-brand/30 text-brand",
  IN_PROGRESS: "border-turquoise/40 text-turquoise",
  COMPLETED: "border-ink/15 text-ink/50",
  CANCELLED: "border-destructive/30 text-destructive",
  NO_SHOW: "border-destructive/30 text-destructive",
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AppointmentsPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.appointments;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const [date, setDate] = useState(todayUtc);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const appointmentsQ = useAppointments({ date: date || undefined });
  const updateAppointment = useUpdateAppointment();
  const removeAppointment = useDeleteAppointment();
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
    () => new Map((servicesQ.data ?? []).map((service) => [service.id, service])),
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

  const rows = useMemo(
    () =>
      [...(appointmentsQ.data ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointmentsQ.data],
  );

  const columns = [
    labels.columns.time,
    labels.columns.customer,
    labels.columns.service,
    labels.columns.staff,
    labels.columns.price,
    labels.columns.status,
    labels.columns.actions,
  ];

  /*
   * Les seules transitions que le métier autorise, et que l'écran propose.
   * Aucun saut en avant ni retour en arrière : un rendez-vous terminé ne
   * redevient pas « en attente » d'un clic. Le serveur reste seul juge — ici on
   * n'affiche que ce qui a un sens.
   */
  const transitions: Record<AppointmentStatus, { to: AppointmentStatus; label: string }[]> = {
    PENDING: [
      { to: "CONFIRMED", label: labels.actions.confirm },
      { to: "CANCELLED", label: labels.actions.cancel },
    ],
    CONFIRMED: [
      { to: "IN_PROGRESS", label: labels.actions.start },
      { to: "CANCELLED", label: labels.actions.cancel },
    ],
    IN_PROGRESS: [
      { to: "COMPLETED", label: labels.actions.complete },
      { to: "NO_SHOW", label: labels.actions.noShow },
    ],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.appointments} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="flex w-full flex-col gap-2 sm:w-52">
            <span className={`${LABEL} text-ink/40`}>{labels.dateLabel}</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
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

      {appointmentsQ.isPending && <Loading />}

      {appointmentsQ.isError && <LoadError onRetry={() => appointmentsQ.refetch()} />}

      {appointmentsQ.isSuccess && rows.length === 0 && (
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

      {updateAppointment.isError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {apiErrorMessage(updateAppointment.error, dict.ui.dashboard.errorBody)}
        </p>
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>

          <div className={`overflow-x-auto border bg-white ${RULE}`}>
            <table className="w-full min-w-[44rem] text-left text-sm">
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
                {rows.map((appointment) => {
                  const service = services.get(appointment.serviceId);

                  return (
                    <tr key={appointment.id} className="border-b border-navy/[0.06] last:border-0">
                      <td className="px-4 py-3 tabular-nums text-ink">
                        {appointment.startTime}
                        <span className="ml-2 text-xs text-ink/35">
                          {appointment.durationMinutes} min
                        </span>
                      </td>

                      <td className="px-4 py-3 text-ink">
                        {customers.get(appointment.customerId) ?? labels.unknownCustomer}
                      </td>

                      <td className="px-4 py-3 text-ink/75">
                        {service?.name ?? labels.unknownService}
                      </td>

                      <td className="px-4 py-3 text-ink/75">
                        {staff.get(appointment.staffId) ?? "—"}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-ink/75">
                        {formatPrice(appointment.price, dict.storefront.priceCurrency, intlLocale)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] ${STATUS_TONE[appointment.status]}`}
                        >
                          {labels.statuses[appointment.status]}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {transitions[appointment.status].map((transition) => (
                            <button
                              key={transition.to}
                              type="button"
                              onClick={() =>
                                updateAppointment.mutate({ id: appointment.id, status: transition.to })
                              }
                              disabled={
                                updateAppointment.isPending &&
                                updateAppointment.variables?.id === appointment.id
                              }
                              className="border border-ink/15 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-40"
                            >
                              {transition.label}
                            </button>
                          ))}

                          {transitions[appointment.status].length === 0 && (
                            <span className="text-xs text-ink/25">—</span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditing(appointment);
                              setSheetOpen(true);
                            }}
                            className="border border-ink/15 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink"
                          >
                            {labels.reschedule}
                          </button>

                          <ConfirmButton
                            label={labels.remove}
                            question={labels.removeQuestion}
                            busyLabel={labels.removeBusy}
                            onConfirm={() => removeAppointment.mutateAsync(appointment.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AppointmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        appointment={editing}
        customers={customersQ.data ?? []}
        services={servicesQ.data ?? []}
        staff={staffQ.data ?? []}
        defaultDate={date || todayUtc()}
      />
    </div>
  );
}
