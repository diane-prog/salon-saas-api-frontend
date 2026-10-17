"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSelect from "@/components/workspace/WorkspaceSelect";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import {
  useAccount,
  useCreateAccount,
  useUpdateAccount,
} from "@/features/users/queries";
import type { Account, AccountInput, AccountRole, AccountUpdate } from "@/features/users/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Compte et accès — ouverture, modification, réinitialisation du mot de passe.
 *
 * DEUX CHOSES QUE CET ÉCRAN NE FAIT PAS, et c'est délibéré :
 *
 * 1. Il ne propose pas le rôle `OWNER`. Le contrat l'accepte, mais un salon a un
 *    propriétaire : en ouvrir un second depuis une liste de comptes est une
 *    décision qui n'a rien d'un geste de formulaire. Les rôles offerts sont donc
 *    ceux du travail quotidien — administrateur, responsable, équipe.
 * 2. Il n'envoie pas d'invitation. Cette API **n'a pas** d'invitation par
 *    e-mail : le mot de passe est choisi ici, à la création, et doit faire huit
 *    caractères. Le dire dans l'aide du champ évite de chercher un bouton qui
 *    n'existe pas.
 *
 * Le mot de passe n'est **jamais relu** : `GET /users/{id}` ne le renvoie pas,
 * et le champ de modification est donc vide par défaut — le remplir remplace le
 * mot de passe, le laisser vide n'y touche pas.
 */
const ASSIGNABLE_ROLES: readonly Exclude<AccountRole, "SUPER_ADMIN" | "OWNER">[] = [
  "ADMIN",
  "MANAGER",
  "STAFF",
];

export default function AccountSheet({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` : nouvel accès. Un compte : modification. */
  account: Account | null;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.accounts.form;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={account ? labels.editTitle : labels.addTitle}
      description={labels.body}
    >
      <AccountForm account={account} onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function AccountForm({ account, onDone }: { account: Account | null; onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.accounts;
  const form = labels.form;

  /* Le compte est relu à l'ouverture : la dernière connexion et l'état peuvent
     avoir changé depuis le chargement de la liste. */
  const fresh = useAccount(account?.id ?? null, account ?? undefined);
  const current = fresh.data ?? account;

  const create = useCreateAccount();
  const update = useUpdateAccount();
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState(() => ({
    firstName: current?.firstName ?? "",
    lastName: current?.lastName ?? "",
    email: current?.email ?? "",
    phone: current?.phone ?? "",
    role: (current?.role && current.role !== "OWNER" && current.role !== "SUPER_ADMIN"
      ? current.role
      : "STAFF") as Exclude<AccountRole, "SUPER_ADMIN" | "OWNER">,
    password: "",
    active: current?.active ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof values, value: string | boolean) =>
    setValues((input) => ({ ...input, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    const email = values.email.trim();

    if (!values.firstName.trim()) found.firstName = form.required;
    if (!values.lastName.trim()) found.lastName = form.required;

    if (!current) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        found.email = form.invalidEmail;
      }
      if (values.password.length < 8) found.password = form.shortPassword;
    } else if (values.password && values.password.length < 8) {
      found.password = form.shortPassword;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);

    try {
      if (current) {
        const patch: AccountUpdate = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone.trim() || undefined,
          role: values.role,
          active: values.active,
          /* Champ vide = mot de passe inchangé : `undefined` disparaît du corps
             JSON, le serveur ne le voit donc jamais. */
          password: values.password ? values.password : undefined,
        };

        await update.mutateAsync({ id: current.id, ...patch });
      } else {
        const input: AccountInput = {
          email,
          password: values.password,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone.trim() || undefined,
          role: values.role,
        };

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
          label={form.fields.firstName}
          name="firstName"
          required
          autoComplete="given-name"
          value={values.firstName}
          onChange={(value) => set("firstName", value)}
          error={errors.firstName}
          disabled={pending}
        />
        <Field
          label={form.fields.lastName}
          name="lastName"
          required
          autoComplete="family-name"
          value={values.lastName}
          onChange={(value) => set("lastName", value)}
          error={errors.lastName}
          disabled={pending}
        />
      </div>

      {/* L'adresse est l'identifiant de connexion : elle ne se retouche pas
          depuis cette feuille, sinon on couperait l'accès de quelqu'un sans le
          prévenir. */}
      <Field
        label={form.fields.email}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required={!current}
        value={values.email}
        onChange={(value) => set("email", value)}
        error={errors.email}
        disabled={pending || Boolean(current)}
      />

      <Field
        label={form.fields.phone}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={(value) => set("phone", value)}
        disabled={pending}
      />

      <WorkspaceSelect
        label={form.fields.role}
        name="role"
        required
        value={values.role}
        onChange={(value) => set("role", value)}
        placeholder={form.fields.role}
        options={ASSIGNABLE_ROLES.map((role) => ({ value: role, label: labels.roles[role] }))}
        disabled={pending}
      />

      <Field
        label={current ? form.fields.newPassword : form.fields.password}
        name="password"
        type="password"
        required={!current}
        autoComplete="new-password"
        hint={current ? form.newPasswordHint : form.passwordHint}
        value={values.password}
        onChange={(value) => set("password", value)}
        error={errors.password}
        disabled={pending}
      />

      {current && (
        <label className="flex items-center gap-3 text-sm text-ink/75">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(event) => set("active", event.target.checked)}
            disabled={pending}
            className="h-4 w-4 rounded border-navy/20 text-brand focus:ring-brand"
          />
          <span className={`${LABEL} text-ink/50`}>{form.activeLabel}</span>
        </label>
      )}

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
          {form.cancel}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {pending ? form.saving : form.save}
        </button>
      </div>
    </form>
  );
}
