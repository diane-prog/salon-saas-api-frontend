"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSelect from "@/components/workspace/WorkspaceSelect";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import {
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
} from "@/features/appointments/queries";
import type { Appointment, AppointmentInput } from "@/features/appointments/types";
import type { Customer } from "@/features/customers/types";
import type { SalonServiceItem } from "@/features/salon-services/types";
import type { StaffMember } from "@/features/staff/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";
import { formatPrice } from "@/lib/price";

/**
 * Rendez-vous — prise au comptoir et replanification.
 *
 * Les trois listes (clientèle, prestations, équipe) sont reçues en propriétés :
 * elles sont déjà chargées par l'écran de l'agenda, qui les affiche. Les
 * redemander ici ferait trois lectures identiques pour un seul formulaire.
 *
 * Le prix et la durée ne sont PAS demandés : le serveur les déduit de la
 * prestation. En revanche, la durée de la prestation choisie est annoncée sous
 * le sélecteur, parce que c'est l'information qui manque au moment de poser
 * l'heure — savoir qu'on bloque 90 minutes change le créneau qu'on annonce.
 *
 * En modification, la fiche est relue par `GET /appointments/{id}` : la ligne de
 * la liste peut dater d'avant une modification faite sur un autre poste.
 */
export default function AppointmentSheet({
  open,
  onOpenChange,
  appointment,
  customers,
  services,
  staff,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` : nouveau rendez-vous. Un rendez-vous : modification. */
  appointment: Appointment | null;
  customers: readonly Customer[];
  services: readonly SalonServiceItem[];
  staff: readonly StaffMember[];
  /** Jour affiché par l'agenda, utilisé comme valeur de départ. */
  defaultDate: string;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.appointments.form;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={appointment ? labels.editTitle : labels.addTitle}
      description={labels.body}
    >
      <AppointmentForm
        appointment={appointment}
        customers={customers}
        services={services}
        staff={staff}
        defaultDate={defaultDate}
        onDone={() => onOpenChange(false)}
      />
    </WorkspaceSheet>
  );
}

function AppointmentForm({
  appointment,
  customers,
  services,
  staff,
  defaultDate,
  onDone,
}: {
  appointment: Appointment | null;
  customers: readonly Customer[];
  services: readonly SalonServiceItem[];
  staff: readonly StaffMember[];
  defaultDate: string;
  onDone: () => void;
}) {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.appointments.form;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const fresh = useAppointment(appointment?.id ?? null, appointment ?? undefined);
  const current = fresh.data ?? appointment;

  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState(() => ({
    customerId: current?.customerId ?? "",
    staffId: current?.staffId ?? "",
    serviceId: current?.serviceId ?? "",
    date: (current?.date ?? defaultDate).slice(0, 10),
    startTime: current?.startTime ?? "",
    notes: current?.notes ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof values, value: string) =>
    setValues((input) => ({ ...input, [key]: value }));

  const chosen = services.find((service) => service.id === values.serviceId);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (!values.customerId) found.customerId = labels.required;
    if (!values.staffId) found.staffId = labels.required;
    if (!values.serviceId) found.serviceId = labels.required;
    if (!values.date) found.date = labels.required;
    if (!values.startTime) found.startTime = labels.required;

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    /* Le contrat attend un instant ISO : le jour choisi est converti une fois,
       en UTC, pour que le serveur et le navigateur parlent du même jour. */
    const date = new Date(`${values.date}T00:00:00.000Z`).toISOString();

    const input: AppointmentInput = {
      customerId: values.customerId,
      staffId: values.staffId,
      serviceId: values.serviceId,
      date,
      startTime: values.startTime,
      notes: values.notes.trim() || undefined,
    };

    try {
      if (current) {
        await update.mutateAsync({ id: current.id, ...input });
      } else {
        await create.mutateAsync(input);
      }
      onDone();
    } catch (error) {
      setFormError(apiErrorMessage(error, dict.ui.dashboard.errorBody));
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <WorkspaceSelect
        label={labels.fields.customer}
        name="customerId"
        value={values.customerId}
        onChange={(value) => set("customerId", value)}
        error={errors.customerId}
        disabled={pending}
        required
        placeholder={labels.choose}
        options={customers.map((customer) => ({
          value: customer.id,
          label: `${customer.firstName} ${customer.lastName}`.trim(),
        }))}
      />

      <WorkspaceSelect
        label={labels.fields.service}
        name="serviceId"
        value={values.serviceId}
        onChange={(value) => set("serviceId", value)}
        error={errors.serviceId}
        disabled={pending}
        required
        placeholder={labels.choose}
        options={services.map((service) => ({ value: service.id, label: service.name }))}
      />

      {chosen && (
        <p className="-mt-3 text-xs text-ink/45">
          {chosen.durationMinutes} min ·{" "}
          {formatPrice(chosen.price, dict.storefront.priceCurrency, intlLocale)}
        </p>
      )}

      <WorkspaceSelect
        label={labels.fields.staff}
        name="staffId"
        value={values.staffId}
        onChange={(value) => set("staffId", value)}
        error={errors.staffId}
        disabled={pending}
        required
        placeholder={labels.choose}
        options={staff.map((member) => ({
          value: member.id,
          label: `${member.firstName} ${member.lastName}`.trim(),
        }))}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.date}
          name="date"
          type="date"
          required
          value={values.date}
          onChange={(value) => set("date", value)}
          error={errors.date}
          disabled={pending}
        />
        <Field
          label={labels.fields.time}
          name="startTime"
          type="time"
          required
          value={values.startTime}
          onChange={(value) => set("startTime", value)}
          error={errors.startTime}
          disabled={pending}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.notes}</span>
        <textarea
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => set("notes", event.target.value)}
          disabled={pending}
          className="resize-y border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand disabled:opacity-60"
        />
      </label>

      {formError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {formError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="border border-ink/15 px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:border-ink/40 disabled:opacity-50"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {pending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}

