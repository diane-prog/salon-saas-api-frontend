"use client";

import { useState, type ReactNode } from "react";

/**
 * Deux tons pour les mêmes champs : `light` sur une page claire (la feuille latérale du
 * contact, la page devis), `dark` sur l'encre du panneau plein écran. Le ton ne change que
 * l'habillage — cadres et libellés — jamais la structure : un champ est un champ.
 */
type Tone = "light" | "dark";

const LABEL_TONE: Record<Tone, string> = {
  light: "text-navy",
  dark: "text-paper/50",
};

/** L'astérisque des champs obligatoires : orange sur clair, turquoise sur l'encre. */
const STAR_TONE: Record<Tone, string> = {
  light: "text-orange",
  dark: "text-turquoise",
};

/**
 * En clair : une boîte arrondie sur fond blanc. Sur l'encre : pas de boîte du tout, un
 * simple filet sous le champ, dans la même écriture que la barre de recherche du panneau —
 * la ligne passe au bleu de marque au focus.
 */
const INPUT_TONE: Record<Tone, string> = {
  light:
    "w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10",
  dark: "w-full border-0 border-b border-paper/25 bg-transparent px-0 py-3 text-lg font-light text-paper outline-none transition-colors duration-300 placeholder:text-paper/25 focus:border-brand",
};

/** Chevron du `<select>`, en jeu de données : un seul des deux est monté par champ. */
const CHEVRON = {
  light:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  dark: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

/**
 * Un champ texte.
 *
 * Il sert DEUX régimes, et c'est voulu : sans `value`, c'est un champ non
 * contrôlé (les formulaires marketing de `ContactSheet` et `DevisSheet`, qui
 * postent leur contenu et n'ont rien à valider avant) ; avec `value` et
 * `onChange`, c'est un champ contrôlé (les écrans d'accès, qui valident à la
 * saisie). Les props de contrôle sont donc optionnelles — aucun appelant
 * existant n'a été touché pour les ajouter.
 *
 * `error` et `hint` s'affichent sous le champ, et le cadre passe au rouge
 * d'échec : le message est au plus près de ce qu'il faut corriger.
 */
export function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  tone = "light",
  value,
  onChange,
  error,
  hint,
  autoFocus = false,
  inputMode,
  maxLength,
  disabled = false,
  list,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  tone?: Tone;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  maxLength?: number;
  disabled?: boolean;
  /**
   * Identifiant d'un `<datalist>` du même formulaire : le champ reste libre,
   * mais propose des valeurs déjà connues (`GET /salon-services/categories`).
   */
  list?: string;
}) {
  const invalid = Boolean(error);

  return (
    <label className="flex flex-col gap-2">
      <span className={`text-xs font-medium uppercase tracking-wider ${LABEL_TONE[tone]}`}>
        {label} {required && <span className={STAR_TONE[tone]}>*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        autoFocus={autoFocus}
        inputMode={inputMode}
        maxLength={maxLength}
        list={list}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={error || hint ? `${name}-note` : undefined}
        className={`${INPUT_TONE[tone]} ${
          invalid ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""
        } ${disabled ? "opacity-60" : ""}`}
      />
      {(error || hint) && (
        <span
          id={`${name}-note`}
          className={`text-xs leading-relaxed ${
            invalid
              ? "text-destructive"
              : tone === "dark"
                ? "text-paper/45"
                : "text-muted"
          }`}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}

export function TextArea({
  label,
  name,
  required = false,
  placeholder,
  tone = "light",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  tone?: Tone;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`text-xs font-medium uppercase tracking-wider ${LABEL_TONE[tone]}`}>
        {label} {required && <span className={STAR_TONE[tone]}>*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={5}
        className={`${INPUT_TONE[tone]} resize-y`}
      />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  placeholder,
  required = false,
  tone = "light",
}: {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  tone?: Tone;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`text-xs font-medium uppercase tracking-wider ${LABEL_TONE[tone]}`}>
        {label} {required && <span className={STAR_TONE[tone]}>*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className={`${INPUT_TONE[tone]} appearance-none bg-[length:1rem] pr-10`}
        style={{
          backgroundImage: CHEVRON[tone],
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormShell({
  children,
  note,
  submitLabel,
  successTitle = "Message envoyé",
  successBody = "Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.",
  tone = "light",
}: {
  children: ReactNode;
  note?: string;
  submitLabel: string;
  /** Confirmation affichée après l'envoi (une page anglaise doit pouvoir la traduire). */
  successTitle?: string;
  successBody?: string;
  tone?: Tone;
}) {
  const [sent, setSent] = useState(false);
  const dark = tone === "dark";

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-turquoise/30 bg-turquoise/[0.06] p-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <h3 className={`text-xl font-light ${dark ? "text-paper" : "text-navy"}`}>{successTitle}</h3>
        <p className={`max-w-sm text-sm leading-relaxed ${dark ? "text-paper/60" : "text-muted"}`}>
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-6"
    >
      {note && (
        <p
          className={`rounded-xl px-4 py-3 text-xs ${
            dark ? "bg-paper/[0.06] text-paper/60" : "bg-navy/[0.04] text-muted"
          }`}
        >
          {note}
        </p>
      )}
      {children}
      <button
        type="submit"
        className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
      >
        {submitLabel}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
