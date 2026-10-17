"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useLogin, useRegister } from "@/features/auth/queries";
import { createRegisterSchema, fieldErrors, slugify } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Ouverture d'un salon, en TROIS ÉTAPES : `POST /auth/register` crée le salon **et** son
 * compte propriétaire en une seule requête.
 *
 * POURQUOI DÉCOUPER : les six informations demandées ne se lisent pas d'un seul tenant — le
 * nom du salon, l'adresse de sa vitrine, l'identité, l'e-mail, le mot de passe. Posées à la
 * suite, elles forment ce long formulaire qu'on abandonne au milieu. Découpées, chaque écran
 * pose une question, et la dernière relit ce qui a été écrit AVANT de créer quoi que ce soit :
 * c'est le dernier moment où l'on peut voir une faute de frappe avant qu'un salon porte ce nom.
 *
 * LES RÈGLES NE SONT PAS DUPLIQUÉES : chaque étape valide sa part du schéma d'inscription
 * (`pick`), la soumission revalide l'ensemble. Une règle ne vit donc qu'à un seul endroit —
 * `features/auth/schemas.ts` — et une étape ne peut pas être plus permissive que le formulaire
 * entier. Le schéma lui-même est construit avec les messages du dictionnaire : les erreurs
 * s'écrivent dans la langue de la page.
 *
 * CE QUI SE PASSE APRÈS, et pourquoi c'est en deux temps : le backend délivre bien un jeton à
 * l'inscription, mais la session du produit passe par le code à 6 chiffres (`/verify-otp`). On
 * enchaîne donc sur `POST /auth/login` — qui envoie le code — puis sur l'écran de
 * vérification. Sauter l'étape reviendrait à ouvrir un espace sans jamais confirmer l'adresse
 * e-mail, ce que le produit ne fait pas.
 *
 * ⚠️ Le parcours `register` → `login` est le seul endroit où le backend est connu pour être
 * capricieux : un `POST /auth/login` peut renvoyer 400 juste après une inscription (course
 * côté serveur). L'échec n'est donc pas bloquant : l'utilisateur est envoyé à la connexion
 * avec sa nouvelle adresse, où il redemandera un code. Un salon créé ne doit jamais être perdu
 * à cause de ça.
 */

/* Les trois marches, dans l'ordre. Le rail les nomme et la navigation s'y appuie ; les
   schémas, eux, se construisent DANS le composant — ils ont besoin des messages de la langue
   de la page (voir `features/auth/schemas.ts`). */
const STEP_KEYS = ["salon", "account", "security"] as const;

/** Une ligne du récapitulatif : l'intitulé à gauche, la valeur saisie à droite. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink/10 pb-2">
      <dt className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink/45">{label}</dt>
      <dd className="text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

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
  /* L'adresse du salon suit le nom tant que l'utilisateur ne l'a pas écrite lui-même : c'est
     une aide, jamais une décision prise à sa place. */
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const last = STEP_KEYS.length - 1;

  /* Un schéma par étape, taillés dans le même schéma d'inscription : chaque étape valide sa
     part, la soumission valide le tout. Les phrases viennent du dictionnaire, donc de la
     langue — un message d'erreur ne peut plus s'afficher dans l'autre langue. */
  const schemas = useMemo(() => {
    const base = createRegisterSchema(auth.validation);
    return {
      full: base,
      steps: [
        base.pick({ tenantName: true, tenantSlug: true }),
        base.pick({ firstName: true, lastName: true, email: true, phone: true }),
        base.pick({ password: true }),
      ] as const,
    };
  }, [auth.validation]);

  /** Les champs d'une étape, lus dans son schéma — jamais écrits une seconde fois. */
  const stepFields = (index: number) => Object.keys(schemas.steps[index].shape);

  const register = useRegister();
  const login = useLogin();
  const pending = register.isPending || login.isPending;

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  /** Retire d'un jeu d'erreurs les champs d'une étape — et le message général. */
  const clearedFor = (current: Record<string, string>, index: number) => {
    const next = { ...current };
    for (const field of stepFields(index)) delete next[field];
    delete next.form;
    return next;
  };

  /** Avance d'une étape, en validant d'abord celle qu'on quitte. */
  const goNext = () => {
    const parsed = schemas.steps[step].safeParse(values);

    if (!parsed.success) {
      setErrors((current) => ({ ...clearedFor(current, step), ...fieldErrors(parsed.error) }));
      return;
    }

    setErrors((current) => clearedFor(current, step));
    setStep((index) => Math.min(index + 1, last));
  };

  /** Recule : un retour ne valide rien, on revient simplement sur ses pas. */
  const goTo = (index: number) => {
    if (index >= step) return;
    setErrors({});
    setStep(index);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    /* Entrée dans un champ, ou bouton « Continuer » : sur une étape intermédiaire, le geste
       avance au lieu d'envoyer. Rien à apprendre — la touche fait ce que le bouton dit. */
    if (step < last) {
      goNext();
      return;
    }

    const parsed = schemas.full.safeParse(values);
    if (!parsed.success) {
      const flat = fieldErrors(parsed.error);
      setErrors(flat);

      /* On RAMÈNE à la première étape fautive : une erreur posée sur un champ qu'on ne voit
         pas ne se corrige pas. */
      const firstInvalid = schemas.steps.findIndex((schema) =>
        Object.keys(schema.shape).some((field) => flat[field]),
      );
      if (firstInvalid >= 0) setStep(firstInvalid);
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
      /* Course connue du backend : le salon existe, le code n'est pas parti. On continue vers
         l'écran de vérification, qui sait redemander un code. */
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

      {/* LE RAIL : trois marches, leur nom, un filet qui marque celle où l'on est. Une marche
          franchie se rejoue d'un clic (le récapitulatif y mène aussi, par « Modifier ») ; une
          marche à venir n'est pas cliquable — on n'avance qu'en validant. `aria-current="step"`
          dit au lecteur d'écran où l'on en est, sans qu'aucun texte n'ait à l'annoncer. */}
      <ol className="grid grid-cols-3">
        {STEP_KEYS.map((key, index) => {
          const state = index === step ? "current" : index < step ? "done" : "todo";

          return (
            <li key={key}>
              <button
                type="button"
                disabled={index > step || pending}
                onClick={() => goTo(index)}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex w-full items-center border-t-2 pt-3 text-left transition-colors duration-300 ${
                  state === "current"
                    ? "border-ink text-ink"
                    : state === "done"
                      ? "cursor-pointer border-ink/25 text-ink/60 hover:text-ink"
                      : "border-ink/10 text-ink/30"
                }`}
              >
                <span className={LABEL}>{auth.register.steps[key]}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <form noValidate onSubmit={submit} className="flex flex-col gap-7">
        {step === 0 && (
          <fieldset className="flex flex-col gap-5">
            <legend className="sr-only">{auth.register.salonTitle}</legend>

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
        )}

        {step === 1 && (
          <fieldset className="flex flex-col gap-5">
            <legend className="sr-only">{auth.register.accountTitle}</legend>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={auth.register.firstName}
                name="firstName"
                required
                autoFocus
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
          </fieldset>
        )}

        {step === 2 && (
          <>
            <fieldset className="flex flex-col gap-5">
              <legend className="sr-only">{auth.register.steps.security}</legend>

              <Field
                label={auth.fields.password}
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="new-password"
                value={values.password}
                onChange={set("password")}
                error={errors.password}
                hint={auth.passwordHint}
              />
            </fieldset>

            {/* LE RÉCAPITULATIF : ce qui va être créé, écrit noir sur blanc. Chaque bloc garde
                sa porte de retour — corriger ici évite d'avoir à revenir en arrière à
                l'aveugle. Le mot de passe n'est jamais réaffiché. */}
            <section className="flex flex-col gap-5 border-t border-ink/10 pt-6">
              <span className={`${LABEL} text-ink/40`}>{auth.register.reviewTitle}</span>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={`${LABEL} text-ink/45`}>{auth.register.steps.salon}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => goTo(0)}
                    className="cursor-pointer text-[0.62rem] uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-ink"
                  >
                    {auth.register.edit}
                  </button>
                </div>

                <dl className="flex flex-col gap-3">
                  <SummaryRow label={auth.register.tenantName} value={values.tenantName} />
                  <SummaryRow label={auth.register.tenantSlug} value={values.tenantSlug} />
                </dl>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={`${LABEL} text-ink/45`}>{auth.register.steps.account}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => goTo(1)}
                    className="cursor-pointer text-[0.62rem] uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-ink"
                  >
                    {auth.register.edit}
                  </button>
                </div>

                <dl className="flex flex-col gap-3">
                  <SummaryRow
                    label={`${auth.register.firstName} ${auth.register.lastName}`}
                    value={`${values.firstName} ${values.lastName}`.trim()}
                  />
                  <SummaryRow label={auth.fields.email} value={values.email} />
                  {values.phone && <SummaryRow label={auth.fields.phone} value={values.phone} />}
                </dl>
              </div>
            </section>
          </>
        )}

        {errors.form && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
          >
            {errors.form}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => goTo(step - 1)}
              className="cursor-pointer border border-ink/15 px-5 py-4 text-sm font-light text-ink/70 transition-colors duration-300 hover:border-ink/40 hover:text-ink"
            >
              {auth.register.back}
            </button>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60 ${
              step > 0 ? "flex-1" : "w-full"
            }`}
          >
            {pending ? auth.loading : step === last ? auth.register.submit : auth.register.next}
          </button>
        </div>

        {step === last && <p className="text-xs leading-relaxed text-muted">{auth.register.terms}</p>}
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
