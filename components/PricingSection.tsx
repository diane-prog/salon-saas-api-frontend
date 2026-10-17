"use client";

import Link from "next/link";

import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Section des forfaits — une grille, quatre plans, un seul repère.
 *
 * VALEURS STATIQUES, et c'est mesuré : `GET /subscriptions/plans` répond 401
 * sans jeton même s'il est documenté comme public. Les montants et quotas
 * viennent du dictionnaire, relevés côté backend ; si le serveur bouge, c'est
 * ici qu'il faut revenir.
 *
 * Dessin : la grille éditoriale du site — filets d'un pixel, papier chaud,
 * coins nets, prix en sérif. Le plan recommandé n'est pas un dégradé : c'est la
 * seule carte sur l'encre, avec un filet laiton. Un seul repère dans une rangée.
 *
 * Aucun paiement n'est en ligne : les boutons mènent tous à l'ouverture d'un
 * salon. Un bouton « Payer » qui ne paie pas serait pire que ce bouton honnête.
 */
export default function PricingSection({
  className = "",
  header = true,
}: {
  className?: string;
  /** Faux sur la page Tarifs, où le hero porte déjà le titre et le chapô. */
  header?: boolean;
}) {
  const { dict, locale } = useDictionary();
  const { pricing } = dict;

  return (
    <section id="tarifs" className={`border-t border-ink/10 bg-paper text-ink ${className}`}>
      <div className="container-x py-16 sm:py-24">
        {header && (
          <div className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="text-[0.64rem] uppercase tracking-[0.22em] text-ink/40">
                {pricing.eyebrow}
              </span>
              <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.015em]">
                {pricing.title}
              </h2>
            </div>
            <div className="flex items-end lg:col-span-5">
              <p className="max-w-md text-sm leading-relaxed text-ink/55">{pricing.lead}</p>
            </div>
          </div>
        )}

        <ul className="grid gap-px bg-ink/15 sm:grid-cols-2 xl:grid-cols-4">
          {pricing.plans.map((plan) => (
            <li
              key={plan.name}
              className={`flex flex-col gap-6 p-6 sm:p-7 ${
                plan.recommended ? "bg-ink text-paper" : "bg-paper"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`text-[0.66rem] uppercase tracking-[0.2em] ${
                    plan.recommended ? "text-turquoise" : "text-ink/50"
                  }`}
                >
                  {plan.name}
                </span>
                {plan.recommended && (
                  <span className="text-[0.58rem] uppercase tracking-[0.16em] text-turquoise/70">
                    {pricing.recommended}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[2.7rem] leading-none tracking-[-0.02em] tabular-nums">
                    {plan.price}
                  </span>
                  <span
                    className={`text-[0.66rem] uppercase tracking-[0.12em] ${
                      plan.recommended ? "text-paper/40" : "text-ink/40"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    plan.recommended ? "text-paper/60" : "text-ink/55"
                  }`}
                >
                  {plan.tagline}
                </p>
              </div>

              <ul
                className={`border-t ${
                  plan.recommended ? "border-paper/15" : "border-ink/15"
                }`}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 border-b py-3 text-sm leading-relaxed ${
                      plan.recommended
                        ? "border-paper/10 text-paper/75"
                        : "border-ink/10 text-ink/65"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                        plan.recommended ? "bg-turquoise" : "bg-brand"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/register`}
                className={`mt-auto inline-flex items-center justify-center px-5 py-3.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                  plan.recommended
                    ? "bg-paper text-ink hover:bg-turquoise"
                    : "border border-ink/20 text-ink hover:border-brand hover:text-brand"
                }`}
              >
                {pricing.cta}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[0.66rem] uppercase leading-relaxed tracking-[0.12em] text-ink/40">
          {pricing.note}
        </p>
      </div>
    </section>
  );
}
