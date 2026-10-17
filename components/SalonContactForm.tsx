"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import { useSendSalonContact } from "@/features/public-salon/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Formulaire de contact de la vitrine — `POST /public/{slug}/contact`.
 *
 * Pourquoi il est séparé de la réservation : écrire au salon ne demande ni
 * prestation, ni créneau, ni disponibilité. Une cliente qui pose une question
 * sur un tarif ne doit pas traverser un parcours de réservation pour le faire.
 *
 * Le contrat (`ContactSalonDto`) ne réclame que le nom, l'e-mail et le message :
 * le téléphone et l'objet restent facultatifs et ne sont envoyés que remplis,
 * jamais en chaîne vide (le backend distingue « absent » de « vide »).
 *
 * Le formulaire ne promet pas de délai de réponse : l'API n'en donne pas, et la
 * vitrine n'a pas à en inventer un.
 */
export default function SalonContactForm({
  slug,
  primary,
}: {
  slug: string;
  primary: string;
}) {
  const { dict } = useDictionary();
  const t = dict.storefront.contact;

  const contact = useSendSalonContact();
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Partial<Record<keyof typeof values, string>> = {};
    if (!values.name.trim()) next.name = t.required;
    if (!values.email.trim()) next.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = t.invalidEmail;
    if (!values.message.trim()) next.message = t.required;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    contact.mutate(
      {
        slug,
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.subject.trim() ? { subject: values.subject.trim() } : {}),
      },
      { onSuccess: () => setSent(true) },
    );
  };

  if (sent) {
    return (
      <div aria-live="polite">
        <h3 className="font-light text-2xl text-ink">{t.successTitle}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">{t.successBody}</p>
        <button
          type="button"
          onClick={() => {
            setValues({ name: "", email: "", phone: "", subject: "", message: "" });
            setSent(false);
          }}
          className="mt-6 rounded-full border border-ink/15 px-5 py-2.5 text-xs text-ink/70 transition-colors hover:border-ink/35"
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.name}
          name="contact-name"
          required
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          disabled={contact.isPending}
        />
        <Field
          label={t.email}
          name="contact-email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          disabled={contact.isPending}
        />
        <Field
          label={t.phone}
          name="contact-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={set("phone")}
          disabled={contact.isPending}
        />
        <Field
          label={t.subject}
          name="contact-subject"
          value={values.subject}
          onChange={set("subject")}
          disabled={contact.isPending}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-navy">
          {t.message} <span className="text-orange">*</span>
        </span>
        <textarea
          name="contact-message"
          rows={5}
          required
          value={values.message}
          onChange={(event) => set("message")(event.target.value)}
          disabled={contact.isPending}
          aria-invalid={Boolean(errors.message) || undefined}
          className="w-full resize-y rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
        />
        {errors.message && <span className="text-xs text-destructive">{errors.message}</span>}
      </label>

      {contact.isError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
        >
          {apiErrorMessage(contact.error, t.error)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={contact.isPending}
          className="rounded-full px-6 py-3 text-sm font-light text-white transition-opacity disabled:opacity-60"
          style={{ background: primary }}
        >
          {contact.isPending ? t.sending : t.submit}
        </button>
        <span className={`${LABEL} text-ink/35`}>{t.requiredHint}</span>
      </div>
    </form>
  );
}
