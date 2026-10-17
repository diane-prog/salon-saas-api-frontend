"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import { useUpdateTenantSettings } from "@/features/tenant/queries";
import type { TenantAppearanceInput, TenantSettings } from "@/features/tenant/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Apparence et réseaux — `PATCH /tenant/settings`.
 *
 * Les couleurs sont saisies en hexadécimal parce que c'est la forme que la
 * vitrine applique, et vérifiées ici : une valeur refusée par le serveur au
 * milieu d'un lot de douze champs ferait perdre toute la saisie pour une faute
 * de frappe.
 *
 * Logo, favicon et bandeau sont des URL : l'API ne reçoit pas de fichier sur
 * cette route, elle stocke l'adresse d'une image déjà hébergée. Le dire dans le
 * libellé évite qu'on y dépose un chemin local.
 */
export default function TenantAppearanceSheet({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TenantSettings;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.settings;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.form.appearanceTitle}
      description={labels.form.appearanceBody}
    >
      <AppearanceForm settings={settings} onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function AppearanceForm({
  settings,
  onDone,
}: {
  settings: TenantSettings;
  onDone: () => void;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.settings.form;

  const update = useUpdateTenantSettings();

  const [values, setValues] = useState(() => ({
    primaryColor: settings.primaryColor ?? "",
    secondaryColor: settings.secondaryColor ?? "",
    accentColor: settings.accentColor ?? "",
    logo: settings.logo ?? "",
    favicon: settings.favicon ?? "",
    heroImage: settings.heroImage ?? "",
    description: settings.description ?? "",
    facebook: settings.facebook ?? "",
    instagram: settings.instagram ?? "",
    tiktok: settings.tiktok ?? "",
    twitter: settings.twitter ?? "",
    website: settings.website ?? "",
    whatsapp: settings.whatsapp ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const pending = update.isPending;

  const set = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    for (const key of ["primaryColor", "secondaryColor", "accentColor"] as const) {
      const value = values[key].trim();
      if (value && !HEX.test(value)) found[key] = labels.invalidColor;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    const optional = (value: string) => value.trim() || undefined;

    const input: TenantAppearanceInput = {
      primaryColor: values.primaryColor.trim() || undefined,
      secondaryColor: values.secondaryColor.trim() || undefined,
      accentColor: values.accentColor.trim() || undefined,
      logo: optional(values.logo),
      favicon: optional(values.favicon),
      heroImage: optional(values.heroImage),
      description: optional(values.description),
      facebook: optional(values.facebook),
      instagram: optional(values.instagram),
      tiktok: optional(values.tiktok),
      twitter: optional(values.twitter),
      website: optional(values.website),
      whatsapp: optional(values.whatsapp),
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
      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label={labels.fields.primaryColor}
          name="primaryColor"
          value={values.primaryColor}
          onChange={(value) => set("primaryColor", value)}
          error={errors.primaryColor}
          disabled={pending}
        />
        <Field
          label={labels.fields.secondaryColor}
          name="secondaryColor"
          value={values.secondaryColor}
          onChange={(value) => set("secondaryColor", value)}
          error={errors.secondaryColor}
          disabled={pending}
        />
        <Field
          label={labels.fields.accentColor}
          name="accentColor"
          value={values.accentColor}
          onChange={(value) => set("accentColor", value)}
          error={errors.accentColor}
          disabled={pending}
        />
      </div>

      <Field
        label={labels.fields.logo}
        name="logo"
        type="url"
        inputMode="url"
        value={values.logo}
        onChange={(value) => set("logo", value)}
        disabled={pending}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.favicon}
          name="favicon"
          type="url"
          inputMode="url"
          value={values.favicon}
          onChange={(value) => set("favicon", value)}
          disabled={pending}
        />
        <Field
          label={labels.fields.heroImage}
          name="heroImage"
          type="url"
          inputMode="url"
          value={values.heroImage}
          onChange={(value) => set("heroImage", value)}
          disabled={pending}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.description}</span>
        <textarea
          name="description"
          rows={4}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          disabled={pending}
          className="resize-y border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand disabled:opacity-60"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["facebook", labels.fields.facebook],
            ["instagram", labels.fields.instagram],
            ["tiktok", labels.fields.tiktok],
            ["twitter", labels.fields.twitter],
            ["website", labels.fields.website],
            ["whatsapp", labels.fields.whatsapp],
          ] as const
        ).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            name={key}
            value={values[key]}
            onChange={(value) => set(key, value)}
            disabled={pending}
          />
        ))}
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
