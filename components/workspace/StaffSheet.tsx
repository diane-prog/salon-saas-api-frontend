"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import {
  useCreateStaffMember,
  useStaffMember,
  useUpdateStaffMember,
} from "@/features/staff/queries";
import type { StaffInput, StaffMember } from "@/features/staff/types";
import { apiErrorMessage } from "@/lib/api-error";

/**
 * Membre de l'équipe — création et modification.
 *
 * Prénom et nom sont les seuls champs obligatoires du contrat. La commission est
 * un TAUX (pourcentage), pas un montant : elle est saisie en texte, convertie
 * une fois, et refusée si elle n'est pas numérique — le serveur n'a pas à
 * recevoir `NaN`.
 *
 * Ce formulaire ne crée pas de compte de connexion (`userId` n'est pas proposé) :
 * ouvrir un accès est un autre geste, avec un rôle, et il appartient à l'écran
 * des comptes.
 *
 * `active` est proposé explicitement : désactiver un membre qui a quitté le
 * salon sans effacer son historique est un besoin courant, et contrairement à
 * une suppression, la fiche reste lisible dans les rendez-vous passés.
 */
export default function StaffSheet({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StaffMember | null;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.staff.form;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={member ? labels.editTitle : labels.addTitle}
      description={labels.body}
    >
      <StaffForm member={member} onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function StaffForm({ member, onDone }: { member: StaffMember | null; onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.staff.form;

  /* La fiche est relue au moment de l'édition : la liste peut avoir quelques
     minutes de retard sur un autre poste, et on écrit sur ce qu'on voit. */
  const fresh = useStaffMember(member?.id ?? null, member ?? undefined);
  const current = fresh.data ?? member;

  const create = useCreateStaffMember();
  const update = useUpdateStaffMember();
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState(() => ({
    firstName: current?.firstName ?? "",
    lastName: current?.lastName ?? "",
    title: current?.title ?? "",
    email: current?.email ?? "",
    phone: current?.phone ?? "",
    specialties: (current?.specialties ?? []).join(", "),
    commission:
      current?.commissionRate === undefined || current?.commissionRate === null
        ? ""
        : String(current.commissionRate),
    active: current?.active ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof values, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (!values.firstName.trim()) found.firstName = labels.required;
    if (!values.lastName.trim()) found.lastName = labels.required;

    const commission = values.commission.trim()
      ? Number(values.commission.replace(",", "."))
      : undefined;
    if (commission !== undefined && (!Number.isFinite(commission) || commission < 0)) {
      found.commission = labels.invalidNumber;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    const input: StaffInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      title: values.title.trim() || undefined,
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      specialties: values.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      commissionRate: commission,
      active: values.active,
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.firstName}
          name="firstName"
          required
          autoComplete="given-name"
          value={values.firstName}
          onChange={(value) => set("firstName", value)}
          error={errors.firstName}
          disabled={pending}
        />
        <Field
          label={labels.fields.lastName}
          name="lastName"
          required
          autoComplete="family-name"
          value={values.lastName}
          onChange={(value) => set("lastName", value)}
          error={errors.lastName}
          disabled={pending}
        />
      </div>

      <Field
        label={labels.fields.title}
        name="title"
        value={values.title}
        onChange={(value) => set("title", value)}
        disabled={pending}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.email}
          name="email"
          type="email"
          inputMode="email"
          value={values.email}
          onChange={(value) => set("email", value)}
          disabled={pending}
        />
        <Field
          label={labels.fields.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={(value) => set("phone", value)}
          disabled={pending}
        />
      </div>

      <Field
        label={labels.fields.specialties}
        name="specialties"
        hint={labels.specialtiesHint}
        value={values.specialties}
        onChange={(value) => set("specialties", value)}
        disabled={pending}
      />

      <Field
        label={labels.fields.commission}
        name="commission"
        inputMode="numeric"
        value={values.commission}
        onChange={(value) => set("commission", value)}
        error={errors.commission}
        disabled={pending}
      />

      <label className="flex items-center gap-3 text-sm text-ink/75">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(event) => set("active", event.target.checked)}
          disabled={pending}
          className="h-4 w-4 rounded border-navy/20 text-brand focus:ring-brand"
        />
        {labels.active}
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
