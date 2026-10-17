"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import { useUpdateTenant } from "@/features/tenant/queries";
import type { Tenant, TenantIdentityInput } from "@/features/tenant/types";
import { apiErrorMessage } from "@/lib/api-error";

/**
 * Identité du salon — `PATCH /tenant/me`.
 *
 * Le nom et le slug sont publics : le slug devient l'adresse de la vitrine. Ils
 * sont donc validés ici (deux caractères au moins, pas d'espace) avant l'envoi,
 * pour une raison simple : une faute de frappe sur le slug casse tous les liens
 * déjà partagés, et le serveur ne peut pas deviner l'intention.
 *
 * Les champs facultatifs vides sont omis du corps : `PATCH` est partiel, et
 * envoyer `phone: ""` demanderait au serveur d'interpréter un effacement que son
 * contrat ne décrit pas.
 */
export default function TenantIdentitySheet({
  open,
  onOpenChange,
  tenant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.settings;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.form.identityTitle}
      description={labels.form.identityBody}
    >
      <IdentityForm tenant={tenant} onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function IdentityForm({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.settings.form;

  const update = useUpdateTenant();

  const [values, setValues] = useState(() => ({
    name: tenant.name ?? "",
    slug: tenant.slug ?? "",
    email: tenant.email ?? "",
    phone: tenant.phone ?? "",
    address: tenant.address ?? "",
    city: tenant.city ?? "",
    country: tenant.country ?? "",
    timezone: tenant.timezone ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const pending = update.isPending;

  const set = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (values.name.trim().length < 2) found.name = labels.required;

    const slug = values.slug.trim().toLowerCase();
    if (slug.length < 2 || /\s/.test(slug)) found.slug = labels.slugHint;

    const email = values.email.trim();
    if (!email || !email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
      found.email = labels.invalidEmail;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    const optional = (value: string) => value.trim() || undefined;

    const input: TenantIdentityInput = {
      name: values.name.trim(),
      slug,
      email,
      phone: optional(values.phone),
      address: optional(values.address),
      city: optional(values.city),
      country: optional(values.country),
      timezone: optional(values.timezone),
    };

    try {
      await update.mutateAsync(input);
      onDone();
    } catch (error) {
      setFormError(apiErrorMessage(error, dict.ui.dashboard.errorBody));
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field
        label={labels.fields.name}
        name="name"
        required
        value={values.name}
        onChange={(value) => set("name", value)}
        error={errors.name}
        disabled={pending}
      />

      <Field
        label={labels.fields.slug}
        name="slug"
        required
        hint={labels.slugHint}
        value={values.slug}
        onChange={(value) => set("slug", value)}
        error={errors.slug}
        disabled={pending}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.email}
          name="email"
          type="email"
          inputMode="email"
          required
          value={values.email}
          onChange={(value) => set("email", value)}
          error={errors.email}
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
        label={labels.fields.address}
        name="address"
        value={values.address}
        onChange={(value) => set("address", value)}
        disabled={pending}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label={labels.fields.city}
          name="city"
          value={values.city}
          onChange={(value) => set("city", value)}
          disabled={pending}
        />
        <Field
          label={labels.fields.country}
          name="country"
          value={values.country}
          onChange={(value) => set("country", value)}
          disabled={pending}
        />
        <Field
          label={labels.fields.timezone}
          name="timezone"
          value={values.timezone}
          onChange={(value) => set("timezone", value)}
          disabled={pending}
        />
      </div>

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
