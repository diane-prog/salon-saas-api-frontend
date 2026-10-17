import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CtaBand from "@/components/CtaBand";
import PricingSection from "@/components/PricingSection";
import { getDictionary, isLocale, localePath } from "@/lib/dictionaries";

/**
 * Page Tarifs.
 *
 * Elle existait sans hero — un simple espace puis la grille des forfaits —, ce
 * qui la faisait ressembler à une ancre d'accueil atteinte par erreur. Elle a
 * désormais sa propre ouverture : sur-titre, titre en sérif, chapô, et trois
 * repères de contrat (essai, engagement, un salon par compte) qui répondent aux
 * questions posées AVANT de lire les prix.
 *
 * `PricingSection` est partagée avec l'accueil : ici, `header={false}` parce
 * que le hero porte déjà le titre et le chapô. Une seule source de chiffres.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);

  return {
    title: dict.pricing.title,
    description: dict.pricing.lead,
    alternates: { canonical: localePath(lang, "/tarifs") },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { pricing } = dict;

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink/10 bg-paper pt-32 text-ink sm:pt-40">
        {/* Le grand chiffre de la maison, en filigrane : un repère de page, pas un décor. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 top-24 select-none font-display text-[13rem] leading-none text-ink/[0.035] sm:text-[19rem]"
        >
          02
        </span>

        <div className="container-x relative grid gap-10 pb-14 sm:pb-20 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <span className="text-[0.64rem] uppercase tracking-[0.22em] text-ink/40">
              {pricing.eyebrow}
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.02em]">
              {pricing.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60">{pricing.lead}</p>
          </div>

          <dl className="flex flex-col justify-end gap-px self-end bg-ink/15 lg:col-span-4">
            {pricing.facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 bg-paper py-3">
                <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-ink/40">
                  {fact.label}
                </dt>
                <dd className="font-display text-lg leading-none text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <PricingSection header={false} className="border-t-0" />

      <CtaBand />
    </>
  );
}
