"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useLogin, useRegister } from "@/features/auth/queries";
import { fieldErrors, registerSchema, slugify } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Ouverture d'un salon — `POST /auth/register` crée le salon **et** son compte
 * propriétaire en une seule requête.
 *
 * CE QUI SE PASSE APRÈS, et pourquoi c'est en deux temps : le backend délivre
 * bien un jeton à l'inscription, mais la session du produit passe par le code à
 * 6 chiffres (`/verify-otp`). On enchaîne donc sur `POST /auth/login` — qui
 * envoie le code — puis sur l'écran de vérification. Sauter l'étape reviendrait
 * à ouvrir un espace sans jamais confirmer l'adresse e-mail, ce que le produit
 * ne fait pas.
 *
 * ⚠️ Le parcours `register` → `login` est le seul endroit où le backend est
 * connu pour être capricieux : un `POST /auth/login` peut renvoyer 400 juste
 * après une inscription (course côté serveur). L'échec n'est donc pas bloquant :
 * l'utilisateur est envoyé à la connexion avec sa nouvelle adresse, où il
 * redemandera un code. Un salon créé ne doit jamais être perdu à cause de ça.
 */
export default function RegisterPage() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const { auth } = dict.ui;

  const [values, setValues] = useState({
    tenantName: "",
    tenantSlug: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  /* L'adresse du salon suit le nom tant que l'utilisateur ne l'a pas écrite
     lui-même : c'est une aide, jamais une décision prise à sa place. */
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = useRegister();
  const login = useLogin();
  const pending = register.isPending || login.isPending;

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});

    const contact = { email: parsed.data.email, password: parsed.data.password };

    try {
      const { tenantName, tenantSlug, firstName, lastName, email, phone, password } = parsed.data;
      await register.mutateAsync({ tenantName, tenantSlug, firstName, lastName, email, phone, password });
    } catch (error) {
      setErrors({ form: apiErrorMessage(error, auth.register.error) });
      return;
    }

    try {
      await login.mutateAsync(contact);
    } catch {
      /* Course connue du backend : le salon existe, le code n'est pas parti. On
         continue vers l'écran de vérification, qui sait redemander un code. */
    }

    router.push(`/${locale}/verify-otp?email=${encodeURIComponent(contact.email)}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/40`}>{auth.register.eyebrow}</span>
        <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {auth.register.title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{auth.register.body}</p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-7">
        <fieldset className="flex flex-col gap-5">
          <legend className={`${LABEL} text-ink/40`}>{auth.register.salonTitle}</legend>

          <Field
            label={auth.register.tenantName}
            name="tenantName"
            required
            autoFocus
            placeholder="Studio Kayao"
            value={values.tenantName}
            onChange={(value) => {
              set("tenantName")(value);
              if (!slugTouched) set("tenantSlug")(slugify(value));
            }}
            error={errors.tenantName}
          />

          <Field
            label={auth.register.tenantSlug}
            name="tenantSlug"
            required
            placeholder="studio-kayao"
            value={values.tenantSlug}
            onChange={(value) => {
              setSlugTouched(true);
              set("tenantSlug")(slugify(value));
            }}
            error={errors.tenantSlug}
            hint={auth.register.slugHint}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className={`${LABEL} text-ink/40`}>{auth.register.accountTitle}</legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={auth.register.firstName}
              name="firstName"
              required
              autoComplete="given-name"
              value={values.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
            />
            <Field
              label={auth.register.lastName}
              name="lastName"
              required
              autoComplete="family-name"
              value={values.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
            />
          </div>

          <Field
            label={auth.fields.email}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
          />

          <Field
            label={auth.fields.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            error={errors.phone}
          />

          <Field
            label={auth.fields.password}
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={values.password}
            onChange={set("password")}
            error={errors.password}
            hint={auth.passwordHint}
          />
        </fieldset>

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
          disabled={pending}
          className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? auth.loading : auth.register.submit}
        </button>

        <p className="text-xs leading-relaxed text-muted">{auth.register.terms}</p>
      </form>

      <p className="text-sm text-muted">
        {auth.register.haveAccount}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-ink underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {auth.register.signIn}
        </Link>
      </p>
    </div>
  );
}
