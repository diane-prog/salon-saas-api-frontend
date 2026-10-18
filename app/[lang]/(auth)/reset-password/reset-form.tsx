"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AxiosError } from "axios";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useResetPassword } from "@/features/auth/queries";
import { createResetPasswordSchema, fieldErrors } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Mot de passe oublié — étape 2 : POSER le nouveau mot de passe.
 *
 * Le jeton vient de l'URL (`?token=…`), pas d'un champ. Trois cas, trois réponses :
 *
 *   1. **Pas de jeton** → on ne fait pas semblant : le lien est incomplet, et l'écran
 *      renvoie vers la demande (`/forgot-password`) au lieu d'afficher un formulaire qui
 *      échouera à coup sûr.
 *   2. **Jeton refusé** (expiré, déjà servi) → le backend répond 400/401/410 ; on affiche
 *      la phrase qui dit quoi faire (« demandez-en un nouveau »), pas une erreur générique.
 *   3. **Succès** → aucune session n'est ouverte : le formulaire laisse place à l'accusé,
 *      puis à la connexion. C'est voulu — le mot de passe vient de changer sur un lien
 *      reçu par courriel, on ne connecte pas d'office.
 *
 * La confirmation est validée à la saisie : c'est le seul endroit où une faute de frappe
 * est invisible, et une faute de frappe ici enferme la personne hors de son salon.
 */
export default function ResetPasswordForm() {
  const { dict, locale } = useDictionary();
  const search = useSearchParams();
  const { auth } = dict.ui;

  const token = search.get("token") ?? "";

  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const reset = useResetPassword();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = createResetPasswordSchema(auth.validation).safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});

    try {
      await reset.mutateAsync({ token, password: parsed.data.password });
      setDone(true);
    } catch (error) {
      /* Un refus de jeton n'est pas une panne : c'est un lien mort. Le message le dit. */
      const status = (error as AxiosError)?.response?.status;
      const fallback =
        status === 400 || status === 401 || status === 410
          ? auth.reset.expired
          : auth.reset.error;

      setErrors({ form: apiErrorMessage(error, fallback) });
    }
  };

  /* Lien sans jeton : aucune raison de montrer deux champs qui ne peuvent pas aboutir. */
  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
        >
          {auth.reset.missingToken}
        </p>
        <Link
          href={`/${locale}/forgot-password`}
          className="text-sm text-ink underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {auth.reset.requestAnother}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>{auth.reset.eyebrow}</span>
          <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {auth.reset.doneTitle}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{auth.reset.doneBody}</p>
        </div>

        <Link
          href={`/${locale}/login`}
          className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          {auth.reset.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/40`}>{auth.reset.eyebrow}</span>
        <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {auth.reset.title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{auth.reset.body}</p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          label={auth.reset.password}
          name="password"
          type="password"
          required
          autoComplete="new-password"
          autoFocus
          value={values.password}
          onChange={(password) => setValues((current) => ({ ...current, password }))}
          error={errors.password}
          hint={auth.passwordHint}
          disabled={reset.isPending}
        />

        <Field
          label={auth.reset.confirm}
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={values.confirm}
          onChange={(confirm) => setValues((current) => ({ ...current, confirm }))}
          error={errors.confirm}
          disabled={reset.isPending}
        />

        {errors.form && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
          >
            <span>{errors.form}</span>
            <Link
              href={`/${locale}/forgot-password`}
              className="w-fit underline underline-offset-4"
            >
              {auth.reset.requestAnother}
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={reset.isPending}
          className="group mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60"
        >
          {reset.isPending ? auth.loading : auth.reset.submit}
        </button>
      </form>
    </div>
  );
}
