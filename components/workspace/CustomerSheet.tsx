"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "@/features/customers/queries";
import type { Customer, CustomerInput, CustomerSource } from "@/features/customers/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Fiche client — création et modification, dans une feuille latérale.
 *
 * POURQUOI UNE FEUILLE ET PAS UNE PAGE : on ajoute une cliente en tenant le
 * téléphone ou en lisant un agenda ; quitter la liste pour un formulaire, puis y
 * revenir, casse ce geste. La feuille garde la liste derrière elle, et se ferme
 * sur un `invalidateQueries` — la ligne apparaît sans rechargement.
 *
 * Le formulaire est monté à la fermeture (`SheetContent` démonte son contenu) :
 * rouvrir sur une autre fiche repart donc des valeurs passées, jamais de celles
 * de la fiche précédente.
 *
 * Les champs obligatoires sont ceux du contrat (`firstName`, `lastName`,
 * `phone`) ; `PATCH /customers/{id}` accepte le même objet, d'où un seul
 * formulaire pour les deux gestes.
 */
const SOURCES: readonly CustomerSource[] = ["WALK_IN", "ONLINE", "REFERRAL", "SOCIAL", "OTHER"];

export default function CustomerSheet({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` : création. Une fiche : modification. */
  customer: Customer | null;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.customers.form;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{customer ? labels.editTitle : labels.addTitle}</SheetTitle>
          <SheetDescription>{labels.body}</SheetDescription>
        </SheetHeader>

        <CustomerForm customer={customer} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function CustomerForm({ customer, onDone }: { customer: Customer | null; onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.customers.form;

  /*
   * La fiche est relue (`GET /customers/{id}`) au moment de l'édition, avec la
   * ligne déjà affichée comme valeur de départ : le formulaire s'ouvre sans
   * attente, puis se corrige si le serveur a mieux à dire. Sur un salon où
   * plusieurs personnes travaillent, la ligne de la liste peut avoir quelques
   * minutes de retard, et on écrit sur ce qu'on voit.
   */
  const fresh = useCustomer(customer?.id ?? null, customer ?? undefined);
  const current = fresh.data ?? customer;

  const create = useCreateCustomer();
  const update = useUpdateCustomer();

  const [values, setValues] = useState(() => ({
    firstName: current?.firstName ?? "",
    lastName: current?.lastName ?? "",
    phone: current?.phone ?? "",
    email: current?.email ?? "",
    notes: current?.notes ?? "",
    tags: (current?.tags ?? []).join(", "),
    source: (current?.source ?? "") as CustomerSource | "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;

  const set = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (!values.firstName.trim()) found.firstName = labels.required;
    if (!values.lastName.trim()) found.lastName = labels.required;
    if (!values.phone.trim()) found.phone = labels.required;
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      found.email = labels.invalidEmail;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    const input: CustomerInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      notes: values.notes.trim() || undefined,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      source: values.source || undefined,
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
        <Field
          label={labels.fields.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          value={values.phone}
          onChange={(value) => set("phone", value)}
          error={errors.phone}
          disabled={pending}
        />
        <Field
          label={labels.fields.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(value) => set("email", value)}
          error={errors.email}
          disabled={pending}
        />
      </div>

      <Field
        label={labels.fields.tags}
        name="tags"
        hint={labels.tagsHint}
        value={values.tags}
        onChange={(value) => set("tags", value)}
        disabled={pending}
      />

      <label className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.source}</span>
        <select
          name="source"
          value={values.source}
          onChange={(event) => set("source", event.target.value)}
          disabled={pending}
          className="border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand"
        >
          <option value="">—</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {dict.ui.dashboard.screens.customers.sources[source]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.notes}</span>
        <textarea
          name="notes"
          rows={4}
          value={values.notes}
          onChange={(event) => set("notes", event.target.value)}
          disabled={pending}
          className="resize-y border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand"
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
