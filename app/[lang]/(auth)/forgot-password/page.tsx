"use client";

import { useState } from "react";
import Link from "next/link";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useForgotPassword } from "@/features/auth/queries";
import { createForgotPasswordSchema, fieldErrors } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Mot de passe oublié — étape 1 : DEMANDER le lien.
 *
 * Le point qui compte : cet écran ne dit **jamais** si l'adresse correspond à un compte.
 * Le backend répond 200 dans les deux cas, et l'accusé affiché est le même. Afficher
 * « adresse inconnue » transformerait ce formulaire en outil pour deviner qui a un salon
 * chez nous — c'est pour cette raison, et pas par approximation, que la confirmation est
 * indistincte.
 *
 * Aucun jeton ne transite par cette page : le lien part par courriel, vers l'adresse du
 * compte. Le composant n'a donc rien à conserver ni à cacher dans l'URL.
 */
export default function ForgotPasswordPage() {
  const { dict, locale } = useDictionary();
  const { auth } = dict.ui;

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const forgot = useForgotPassword();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = createForgotPasswordSchema(auth.validation).safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});

    try {
      await forgot.mutateAsync(parsed.data);
      setSent(true);
    } catch (error) {
      setErrors({ form: apiErrorMessage(error, auth.forgot.error) });
    }
  };

  /* L'accusé remplace le formulaire : on ne laisse pas le champ à l'écran, sinon on
     re-clique et on renvoie un second lien sans s'en rendre compte. */
  if (sent) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>{auth.forgot.eyebrow}</span>
          <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {auth.forgot.sentTitle}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {auth.forgot.sentBody}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="group inline-flex items-center justify-center gap-2 border border-ink/15 px-7 py-4 text-sm font-light text-ink transition-colors duration-300 hover:border-ink"
          >
            {auth.forgot.sentAgain}
          </button>

          <Link
            href={`/${locale}/login`}
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            {auth.forgot.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/40`}>{auth.forgot.eyebrow}</span>
        <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {auth.forgot.title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{auth.forgot.body}</p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          label={auth.fields.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={setEmail}
          error={errors.email}
          hint={auth.forgot.note}
          disabled={forgot.isPending}
        />

        {errors.form && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
          >
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={forgot.isPending}
          className="group mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60"
        >
          {forgot.isPending ? auth.loading : auth.forgot.submit}
        </button>
      </form>

      <Link
        href={`/${locale}/login`}
        className="text-sm text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
      >
        {auth.forgot.backToLogin}
      </Link>
    </div>
  );
}
