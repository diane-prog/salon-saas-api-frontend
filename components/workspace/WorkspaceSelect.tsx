"use client";

import { LABEL } from "@/lib/editorial";

/**
 * Choix dans une liste, dans une feuille de l'espace salon.
 *
 * Le `Select` de `components/Form` n'est pas réutilisé : il est **non contrôlé**
 * (il sert aux formulaires marketing, qui postent sans valider). Les feuilles de
 * l'espace salon valident avant d'envoyer et ont donc besoin de la valeur à
 * chaque changement.
 *
 * Une valeur vide est permise : elle affiche l'invite, qui reste désactivée —
 * on ne peut pas « choisir » le vide, seulement ne rien avoir encore choisi.
 */
export default function WorkspaceSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`${LABEL} text-ink/50`}>
        {label} {required && <span className="text-orange">*</span>}
      </span>

      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand disabled:opacity-60 ${
          error ? "border-destructive" : "border-navy/10"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
