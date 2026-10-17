"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useLogin } from "@/features/auth/queries";
import { createLoginSchema, fieldErrors } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Étape 1 de la connexion.
 *
 * Le point à comprendre : `POST /auth/login` **ne connecte pas**. Il vérifie le
 * couple e-mail / mot de passe et envoie un code à 6 chiffres (valable 10
 * minutes). L'écran enchaîne donc sur `/verify-otp`, en transmettant l'adresse
 * dans l'URL — elle seule l'intéresse, et le code part sur cette boîte.
 *
 * Les erreurs affichées sont celles du backend quand il en donne une
 * (`apiErrorMessage`) : « Invalid email or password » dit quoi corriger, un
 * message générique non.
 */
export default function LoginPage() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const { auth } = dict.ui;

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useLogin();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    /* Le schéma se construit avec les messages du dictionnaire : l'erreur s'écrit dans la
       langue de la page, jamais dans celle du code. */
    const parsed = createLoginSchema(auth.validation).safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});

    try {
      await login.mutateAsync(parsed.data);
      router.push(`/${locale}/verify-otp?email=${encodeURIComponent(parsed.data.email)}`);
    } catch (error) {
      setErrors({ form: apiErrorMessage(error, auth.login.error) });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/40`}>{auth.login.eyebrow}</span>
        <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {auth.login.title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{auth.login.body}</p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          label={auth.fields.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={values.email}
          onChange={(email) => setValues((current) => ({ ...current, email }))}
          error={errors.email}
        />

        <Field
          label={auth.fields.password}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={values.password}
          onChange={(password) => setValues((current) => ({ ...current, password }))}
          error={errors.password}
          disabled={login.isPending}
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
          disabled={login.isPending}
          className="group mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60"
        >
          {login.isPending ? auth.loading : auth.login.submit}
        </button>
      </form>

      <p className="text-sm text-muted">
        {auth.login.noAccount}{" "}
        <Link
          href={`/${locale}/register`}
          className="text-ink underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {auth.login.createAccount}
        </Link>
      </p>
    </div>
  );
}
