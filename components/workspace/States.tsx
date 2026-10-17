"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL, RULE } from "@/lib/editorial";

/**
 * Les états que partagent les écrans de données de l'espace salon.
 *
 * Ils sont écrits une fois : un écran qui afficherait son propre « Chargement… » finirait
 * par ne plus dire la même chose que les autres. Le chargement ne prétend rien, l'erreur
 * dit quoi refaire (avec le bouton qui le fait), le vide dit pourquoi l'écran est vide **et
 * quel geste le remplit** — jamais un tableau vide sans phrase ni sans issue.
 *
 * DEPUIS LA REFONTE : l'en-tête est éditorial (titre sérif, filet, actions à droite), et le
 * vide accepte une action. C'est ce qui manquait le plus : un écran vide constatait
 * l'absence sans jamais proposer le premier pas, alors que c'est exactement le moment où
 * on en a besoin.
 */

/** En-tête commun : sur-titre, titre sérif, phrase d'intention, actions. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <header className="grid gap-6 border-b border-ink/10 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-brand/70" />
          <span className={`${LABEL} text-ink/40`}>{eyebrow}</span>
        </span>
        <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.02] tracking-[-0.015em] text-ink">
          {title}
        </h1>
        <p className={`max-w-xl ${BODY} text-ink/60`}>{lead}</p>
      </div>

      {children ? <div className="flex flex-wrap items-end gap-3">{children}</div> : null}
    </header>
  );
}

export function Loading() {
  const { dict } = useDictionary();

  return (
    <p aria-busy="true" className={`${BODY} text-ink/40`}>
      {dict.ui.dashboard.loading}
    </p>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard;

  return (
    <section className={`border ${RULE} bg-white p-6`}>
      <h2 className="font-display text-xl text-ink">{labels.errorTitle}</h2>
      <p className={`mt-2 ${BODY} text-ink/60`}>{labels.errorBody}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
      >
        {labels.retry}
      </button>
    </section>
  );
}

/** Première action proposée par un écran vide : un mot, et le geste qui suit. */
export type EmptyAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

export function Empty({
  title,
  body,
  action,
  hint,
}: {
  title: string;
  body: string;
  action?: EmptyAction;
  /** Petit rappel sous l'action : « où cela apparaît ensuite ». */
  hint?: string;
}) {
  return (
    <div className={`border ${RULE} bg-white px-6 py-10 sm:px-8 sm:py-12`}>
      <span aria-hidden className={`${LABEL} text-ink/25`}>—</span>
      <h2 className="mt-3 font-display text-2xl leading-tight text-ink">{title}</h2>
      <p className={`mt-2 max-w-md ${BODY} text-ink/55`}>{body}</p>

      {action ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          {action.href ? (
            <Link
              href={action.href as never}
              className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
            >
              {action.label}
            </button>
          )}
          {hint ? <p className="text-xs text-ink/40">{hint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
