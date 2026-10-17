"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import {
  useCreateSalonServiceItem,
  useSalonServiceCategories,
  useSalonServiceItem,
  useUpdateSalonServiceItem,
} from "@/features/salon-services/queries";
import type { SalonServiceInput, SalonServiceItem } from "@/features/salon-services/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Prestation — création et modification.
 *
 * Trois champs sont obligatoires, parce que le contrat l'exige : nom, durée et
 * prix. La durée et le prix sont saisis en texte puis convertis UNE fois, à
 * l'envoi ; une valeur non numérique est refusée avec un message, jamais
 * transformée en `NaN`.
 *
 * `active` et `bookableOnline` sont deux interrupteurs distincts et le restent :
 * une prestation peut exister au comptoir sans être réservable en ligne. Les
 * fusionner ferait disparaître un cas réel.
 */
export default function ServiceSheet({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: SalonServiceItem | null;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.services.form;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={service ? labels.editTitle : labels.addTitle}
      description={labels.body}
    >
      <ServiceForm service={service} onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function ServiceForm({
  service,
  onDone,
}: {
  service: SalonServiceItem | null;
  onDone: () => void;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.services.form;

  /* La prestation est relue au moment de l'édition : le catalogue peut avoir
     changé ailleurs depuis l'affichage de la liste. */
  const fresh = useSalonServiceItem(service?.id ?? null, service ?? undefined);
  const current = fresh.data ?? service;

  const categoriesQ = useSalonServiceCategories();

  const create = useCreateSalonServiceItem();
  const update = useUpdateSalonServiceItem();
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState(() => ({
    name: current?.name ?? "",
    category: current?.category ?? "",
    duration: current ? String(current.durationMinutes) : "",
    price: current ? String(current.price) : "",
    description: current?.description ?? "",
    active: current?.active ?? true,
    bookableOnline: current?.bookableOnline ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof values, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    const duration = Number(values.duration.replace(",", "."));
    const price = Number(values.price.replace(",", "."));

    if (!values.name.trim()) found.name = labels.required;
    if (!Number.isFinite(duration) || duration <= 0) found.duration = labels.invalidNumber;
    if (!Number.isFinite(price) || price < 0) found.price = labels.invalidNumber;

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    const input: SalonServiceInput = {
      name: values.name.trim(),
      durationMinutes: duration,
      price,
      category: values.category.trim() || undefined,
      description: values.description.trim() || undefined,
      active: values.active,
      bookableOnline: values.bookableOnline,
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
      <Field
        label={labels.fields.name}
        name="name"
        required
        value={values.name}
        onChange={(value) => set("name", value)}
        error={errors.name}
        disabled={pending}
      />

      {/*
        Le champ reste libre : `GET /salon-services/categories` ne fait que
        proposer les rubriques déjà employées. Deux façons d'écrire la même
        catégorie créent deux rayons sur la vitrine, et personne ne le voit
        avant de les compter.
      */}
      <Field
        label={labels.fields.category}
        name="category"
        list="service-categories"
        hint={labels.categoryHint}
        value={values.category}
        onChange={(value) => set("category", value)}
        disabled={pending}
      />

      <datalist id="service-categories">
        {(categoriesQ.data ?? [])
          .filter((category): category is string => typeof category === "string")
          .map((category) => (
            <option key={category} value={category} />
          ))}
      </datalist>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={labels.fields.duration}
          name="duration"
          required
          inputMode="numeric"
          value={values.duration}
          onChange={(value) => set("duration", value)}
          error={errors.duration}
          disabled={pending}
        />
        <Field
          label={labels.fields.price}
          name="price"
          required
          inputMode="numeric"
          value={values.price}
          onChange={(value) => set("price", value)}
          error={errors.price}
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
          className="resize-y border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand"
        />
      </label>

      <div className="flex flex-col gap-2">
        {[
          { key: "active" as const, label: labels.active },
          { key: "bookableOnline" as const, label: labels.bookableOnline },
        ].map((toggle) => (
          <label key={toggle.key} className="flex items-center gap-3 text-sm text-ink/75">
            <input
              type="checkbox"
              checked={values[toggle.key]}
              onChange={(event) => set(toggle.key, event.target.checked)}
              disabled={pending}
              className="h-4 w-4 rounded border-navy/20 text-brand focus:ring-brand"
            />
            {toggle.label}
          </label>
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
