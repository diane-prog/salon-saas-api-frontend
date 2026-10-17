import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeroSection } from "@/components/sections";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";
import { LABEL } from "@/lib/editorial";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.contactPage.title,
    description: dict.contactPage.lead,
    alternates: { canonical: localePath(lang, "/contact") },
  };
}

/**
 * Page Contact — une FICHE, pas un formulaire.
 *
 * CE QUI A CHANGÉ, ET POURQUOI : la page ouvrait un panneau contenant un formulaire de
 * six champs, précédé d'une gerbe d'icônes de réseaux. Les deux gênaient plus qu'ils
 * n'aidaient : un visiteur qui veut joindre la maison a déjà son client de messagerie,
 * et les réseaux du site n'existent pas encore (`site.socials` est vide). Ils sont donc
 * retirés d'ICI. Le formulaire, lui, n'est pas perdu : il vit dans la barre d'actions
 * flottante (`ActionDock`), accessible depuis toutes les pages.
 *
 * Ce qui reste tient en trois blocs, dans le vocabulaire du site :
 *
 *   1. le hero des pages internes — l'étiquette, le titre, le chapô ;
 *   2. la FICHE : à gauche le titre d'échange et les deux actions réelles (courriel,
 *      téléphone, liens natifs), à droite les coordonnées en lignes à filets — c'est le
 *      contenu de la page, pas une illustration ;
 *   3. le DÉROULÉ d'un premier échange, en trois cases numérotées.
 *
 * Aucun panneau produit, aucune photo d'ambiance : sur une page de contact, la preuve
 * c'est la réponse qu'on obtient, pas un écran qu'on montre.
 */
export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { contactPage, ui } = dict;

  /* Les deux actions viennent des coordonnées déjà listées : une seule source, un
     changement d'adresse ne se fait qu'à un endroit. */
  const mailto = contactPage.info.find((item) => item.href?.startsWith("mailto:"))?.href;
  const tel = contactPage.info.find((item) => item.href?.startsWith("tel:"))?.href;

  return (
    <>
      {/* Le hero des pages internes : étiquette, titre, chapô. */}
      <HeroSection eyebrow={ui.talkToUs} title={contactPage.title} body={contactPage.lead} />

      {/* ——— La fiche : actions à gauche, coordonnées à droite. */}
      <section className="bg-white text-ink">
        <div className="container-x pb-16 pt-4 sm:pb-20 sm:pt-6 lg:pb-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="max-w-[16ch] font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-light leading-[1.08] tracking-[-0.02em]">
                {contactPage.heading}
              </h2>

              <div className="mt-8 flex flex-wrap gap-3">
                {mailto && (
                  <a
                    href={mailto}
                    className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
                  >
                    {contactPage.actions.email}
                    <span aria-hidden>→</span>
                  </a>
                )}

                {tel && (
                  <a
                    href={tel}
                    className="inline-flex items-center gap-2 border border-ink/20 px-6 py-3.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink/70 transition-colors hover:border-ink hover:text-ink"
                  >
                    {contactPage.actions.call}
                  </a>
                )}
              </div>

              <p className={`${LABEL} mt-8 max-w-[26ch] leading-[2] text-ink/35`}>
                {contactPage.note}
              </p>
            </div>

            {/* Les coordonnées : une ligne par information, filet au-dessus, valeur en
                grand corps clair — la même écriture que les listes de données du site. */}
            <dl className="lg:col-span-7">
              {contactPage.info.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-5 border-t border-ink/10 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className={`${LABEL} text-ink/35`}>{item.label}</dt>
                  <dd className="min-w-0 font-display text-[clamp(1.05rem,1.7vw,1.45rem)] font-light leading-tight">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="break-words transition-colors hover:text-brand"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ——— Le déroulé d'un premier échange : trois cases numérotées, filet par case. */}
      <section className="bg-white text-ink">
        <div className="container-x pb-20 sm:pb-24">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-ink/10 pt-6">
            <h2 className={`${LABEL} text-ink/40`}>{contactPage.processTitle}</h2>
            <span className={`${LABEL} text-ink/25`}>[ 01 — 03 ]</span>
          </div>

          <ol className="mt-8 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
            {contactPage.process.map((step, index) => (
              <li key={step.title} className="border border-ink/12 p-6 sm:p-7">
                <span className={`${LABEL} tabular-nums text-ink/25`}>
                  [ {String(index + 1).padStart(2, "0")} ]
                </span>

                <h3 className="mt-4 font-display text-[1.15rem] font-light leading-tight">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-[34ch] text-[0.85rem] leading-[1.65] text-ink/55">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
