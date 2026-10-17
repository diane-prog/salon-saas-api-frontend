import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CtaBand from "@/components/CtaBand";
import { ProductShowcase } from "@/components/ProductShowcase";
import { getDictionary, isLocale, localePath } from "@/lib/dictionaries";

/**
 * « Le produit en vrai » — ancienne page Réalisations.
 *
 * POURQUOI ELLE A CHANGÉ DE NATURE : elle portait six études de cas d'agence
 * (identité visuelle d'un événement étudiant, maquettes publicitaires…). C'étaient
 * de vrais projets, mais pas ceux d'un logiciel de salon : les montrer revenait à
 * vendre autre chose que le produit. La page expose désormais le produit
 * lui-même, alimenté par l'API réelle du salon de démonstration — ses
 * prestations, son équipe, ses photos, ses avis.
 *
 * L'adresse reste `/realisations` : des liens existaient (pages fonctionnalités,
 * recherche, assistant), et une adresse qui casse est toujours pire qu'une page
 * qui change de contenu.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/realisations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.showcase.title,
    description: dict.showcase.lead,
    alternates: { canonical: localePath(lang, "/realisations") },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/realisations">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.showcase;

  return (
    <>
      <header className="border-b border-ink/10 bg-paper pt-32 text-ink sm:pt-40">
        <div className="container-x grid gap-8 pb-14 sm:pb-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-[0.64rem] uppercase tracking-[0.22em] text-ink/40">
              {t.eyebrow}
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1] tracking-[-0.02em]">
              {t.title}
            </h1>
          </div>
          <div className="flex items-end lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-ink/60">{t.lead}</p>
          </div>
        </div>
      </header>

      <ProductShowcase />

      <CtaBand />
    </>
  );
}
