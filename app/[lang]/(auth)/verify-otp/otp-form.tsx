"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Field } from "@/components/Form";
import { useDictionary } from "@/components/DictionaryProvider";
import { useResendOtp, useVerifyOtp } from "@/features/auth/queries";
import { fieldErrors, verifyOtpSchema } from "@/features/auth/schemas";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/** Durée de vie du code, en secondes — `expiresIn: 600` dans la réponse de l'API. */
const OTP_TTL_SECONDS = 600;

/** Délai avant de pouvoir redemander un code : évite d'en noyer la boîte. */
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Étape 2 de la connexion : le code à 6 chiffres.
 *
 * `POST /auth/verify-otp` est le **seul** endroit où la session commence : c'est
 * son `accessToken` que `features/auth/api.ts` range dans `localStorage`, et que
 * l'intercepteur relira ensuite à chaque requête. La redirection vers
 * `/dashboard` se fait APRÈS le succès de la mutation, jamais avant.
 *
 * L'adresse est transmise par l'URL et non gardée en mémoire : recharger la page
 * ne doit pas renvoyer l'utilisateur à l'écran précédent, et le backend a besoin
 * de cette adresse pour retrouver le code.
 */
export default function OtpForm() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const { auth } = dict.ui;

  const email = search.get("email") ?? "";

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(OTP_TTL_SECONDS);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const verify = useVerifyOtp();
  const resend = useResendOtp();

  /* Un seul intervalle pour les deux comptes à rebours : celui du code, et celui
     avant de pouvoir en redemander un. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((seconds) => (seconds > 0 ? seconds - 1 : 0));
      setCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = verifyOtpSchema.safeParse({ email, code });
    if (!parsed.success) {
      setErrors({ ...fieldErrors(parsed.error), form: "" });
      return;
    }

    setErrors({});

    try {
      await verify.mutateAsync(parsed.data);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      setErrors({ form: apiErrorMessage(error, auth.otp.error) });
    }
  };

  const requestNewCode = async () => {
    try {
      await resend.mutateAsync({ email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setRemaining(OTP_TTL_SECONDS);
      setCode("");
      setErrors({});
      toast({ title: auth.otp.sent, description: email });
    } catch (error) {
      setErrors({ form: apiErrorMessage(error, auth.otp.error) });
    }
  };

  /* Adresse absente : on ne laisse pas l'écran sans porte de sortie. */
  if (!email) {
    return (
      <div className="flex flex-col gap-6">
        <p className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive">
          {auth.otp.missingEmail}
        </p>
        <Link
          href={`/${locale}/login`}
          className="text-sm text-ink underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {auth.otp.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/40`}>{auth.otp.eyebrow}</span>
        <h1 className="font-light text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {auth.otp.title}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          {auth.otp.body} <span className="text-ink">{email}</span>
        </p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          label={auth.otp.code}
          name="code"
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          /* Le champ n'accepte que des chiffres : on filtre à la saisie plutôt
             que d'afficher une erreur pour un caractère qui n'aurait jamais dû
             entrer. */
          onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
          error={errors.code}
          hint={`${formatCountdown(remaining)}`}
          disabled={verify.isPending}
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
          disabled={verify.isPending || code.length !== 6}
          className="group mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60"
        >
          {verify.isPending ? auth.loading : auth.otp.submit}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <button
          type="button"
          onClick={requestNewCode}
          disabled={cooldown > 0 || resend.isPending}
          className="text-ink underline-offset-4 transition-colors hover:text-brand hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          {cooldown > 0
            ? `${auth.otp.resendIn} ${cooldown} ${auth.otp.seconds}`
            : auth.otp.resend}
        </button>

        <Link
          href={`/${locale}/login`}
          className="text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {auth.otp.changeEmail}
        </Link>
      </div>
    </div>
  );
}
