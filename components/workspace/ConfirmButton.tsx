"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { apiErrorMessage } from "@/lib/api-error";

/**
 * Suppression en deux temps, dans la ligne concernée.
 *
 * Un `window.confirm` sortirait de la page, casserait le fil de l'écran et
 * afficherait une boîte au style du navigateur au milieu d'une interface
 * dessinée. Ici la ligne elle-même demande confirmation : le bouton devient la
 * question, deux réponses suffisent, et rien n'est supprimé avant le second
 * clic. Le libellé de la question vient de l'écran, jamais d'ici.
 */
export default function ConfirmButton({
  label,
  question,
  busyLabel,
  onConfirm,
  className = "",
}: {
  label: string;
  question: string;
  busyLabel: string;
  onConfirm: () => Promise<unknown>;
  className?: string;
}) {
  const { dict } = useDictionary();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={
          className ||
          "text-xs text-ink/45 underline-offset-4 transition-colors hover:text-destructive hover:underline"
        }
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs text-ink/60">{error ?? question}</span>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await onConfirm();
          } catch (caught) {
            setError(apiErrorMessage(caught, dict.ui.dashboard.errorBody));
          } finally {
            setBusy(false);
          }
        }}
        className="bg-destructive px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {busy ? busyLabel : label}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setAsking(false);
          setError(null);
        }}
        className="border border-ink/15 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 disabled:opacity-50"
      >
        {dict.ui.dashboard.cancel}
      </button>
    </span>
  );
}
