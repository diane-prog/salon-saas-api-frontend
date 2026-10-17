"use client";

import Link from "next/link";

import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { ProductPanel } from "@/components/ProductPanel";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";
import { LABEL } from "@/lib/editorial";

/**
 * Gabarit commun aux six pages de fonctionnalité.
 *
 * CE QUI A CHANGÉ : la page était une suite de blocs « étiquette à gauche, contenu à
 * droite » empilés jusqu'en bas, avec un hero clair identique à toutes les pages internes.
 * Rien n'y disait qu'on était entré dans UNE fonctionnalité précise : le titre, la méthode
 * et la conclusion se ressemblaient d'une page à l'autre, et la page n'avait pas de
 * silhouette propre.
 *
 * Ici la page a une ossature, la même pour les six, et l'ordre se lit de haut en bas :
 *
 *   1. OUVERTURE — le numéro de la fonctionnalité (`03 / 06`), le titre en très grand,
 *      le sous-titre et l'écran du produit. Un filigrane du numéro occupe le fond.
 *   2. POURQUOI — une phrase qui engage, en tête de colonne, et le texte qui la tient.
 *   3. CE QUE ÇA DONNE — les capacités en cases numérotées à filets (deux colonnes).
 *   4. COMMENT ÇA MARCHE — les quatre étapes en rail horizontal, une case par étape.
 *   5. LA SORTIE — bande d'encre, l'affirmation du service, un bouton carré.
 *   6. LES AUTRES FONCTIONNALITÉS — trois colonnes de cases, pour continuer la visite.
 *
 * Aucun contenu n'est inventé : tout vient des champs du dictionnaire déjà utilisés
 * (`heroTitle`, `heroSubtitle`, `whyTitle`, `whyBody`, `offerings`, `steps`, `ctaTitle`,
 * `ctaBody`). Seule la mise en page est nouvelle — et elle ne dépend d'aucune image.
 */
const PANEL: Record<string, "agenda" | "booking" | "clients" | "catalogue" | "team" | "numbers"> =
  {
    agenda: "agenda",
    "reservation-en-ligne": "booking",
    "fiches-clients": "clients",
    prestations: "catalogue",
    equipe: "team",
    pilotage: "numbers",
  };

/** Le numéro sur deux chiffres, la forme commune à toutes les cases numérotées du site. */
const num = (index: number) => String(index + 1).padStart(2, "0");

export default function ServicePageTemplate({ service }: { service: Service }) {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const others = dict.services.filter((s) => s.slug !== service.slug);
  const ui = dict.ui;
  const index = dict.services.findIndex((s) => s.slug === service.slug);

  return (
    <>
      {/* ——— 1. Ouverture : le numéro, le titre, le sous-titre, l'écran du produit. */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-paper text-ink">
        {/* Le numéro en filigrane : la page porte son rang dans la série. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[clamp(9rem,26vw,22rem)] leading-none tracking-[-0.05em] text-ink/[0.045]"
        >
          {num(index)}
        </span>

        <div className="container-x relative pb-16 pt-32 sm:pt-36 lg:pb-24 lg:pt-40">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className={`${LABEL} text-ink/40`}>
              {num(index)} / {num(dict.services.length - 1)} · {ui.expertise}
            </span>

            <Link
              href={href("/services")}
              className={`${LABEL} text-ink/40 transition-colors hover:text-ink`}
            >
              {ui.ourOffer}
            </Link>
          </div>

          <h1 className="mt-8 max-w-[15ch] text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.95] tracking-[-0.035em]">
            {service.heroTitle}
          </h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-16">
            <div>
              <p className="max-w-md text-[1.02rem] leading-[1.65] text-ink/60">
                {service.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <Link
                  href={href("/register")}
                  className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
                >
                  {ui.freeQuote}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  href={href("/realisations")}
                  className="text-[0.64rem] uppercase tracking-[0.16em] text-ink/50 underline decoration-ink/20 underline-offset-[6px] transition-colors hover:text-ink"
                >
                  {ui.viewAllProjects}
                </Link>
              </div>
            </div>

            {/* L'écran dont parle la page, montré plutôt que décrit. */}
            <Reveal className="w-full justify-self-end lg:max-w-lg">
              <ProductPanel variant={PANEL[service.slug] ?? "agenda"} />
            </Reveal>
          </div>
        </div>
      </section>

      <div className="bg-paper text-ink">
        {/* ——— 2. Pourquoi : la phrase en tête de colonne, le texte à droite. */}
        <section className="container-x py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <span className={`${LABEL} text-ink/40`}>{ui.presentation}</span>
              <h2 className="mt-5 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.15rem)] font-light leading-[1.1] tracking-[-0.02em]">
                {service.whyTitle}
              </h2>
            </div>

            <Reveal className="lg:col-span-8">
              <p className="max-w-2xl text-[1.05rem] leading-[1.75] text-ink/70">{service.whyBody}</p>
            </Reveal>
          </div>
        </section>

        {/* ——— 3. Ce que ça donne : des cases numérotées, un filet entre elles. */}
        <section className="border-t border-ink/10">
          <div className="container-x py-20 sm:py-24">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <span className={`${LABEL} text-ink/40`}>{ui.ourOffer}</span>
              <span className={`${LABEL} text-ink/30`}>
                {String(service.offerings.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
              {service.offerings.map((item, i) => (
                <li key={item} className="bg-white">
                  <Reveal as="div" delay={i * 50} className="h-full">
                    <div className="flex h-full min-h-[7.5rem] flex-col justify-between gap-6 p-6">
                      <span className="text-[0.6rem] font-medium tabular-nums tracking-[0.14em] text-ink/35">
                        {num(i)}
                      </span>
                      <p className="max-w-[32ch] text-[0.98rem] leading-snug text-ink">{item}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ——— 4. Comment ça marche : le rail des étapes, une case par étape. */}
        <section className="border-t border-ink/10">
          <div className="container-x py-20 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <span className={`${LABEL} text-ink/40`}>{ui.methodology}</span>
                <h2 className="mt-5 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.15rem)] font-light leading-[1.1] tracking-[-0.02em]">
                  {service.processLabel}
                </h2>
                <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-ink/55">
                  {service.processIntro}
                </p>
              </div>

              <ol className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:col-span-8">
                {service.steps.map((step, i) => (
                  <li key={step.title} className="bg-white">
                    <Reveal as="div" delay={i * 60} className="h-full">
                      <div className="flex h-full min-h-[9.5rem] flex-col gap-4 p-6">
                        <span className="text-[0.6rem] font-medium tabular-nums tracking-[0.14em] text-ink/35">
                          {num(i)}
                        </span>
                        <h3 className="text-[1.05rem] font-light leading-snug text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-auto text-[0.82rem] leading-relaxed text-ink/55">
                          {step.body}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ——— 5. La sortie : bande d'encre, l'affirmation du service, la sortie vers le
                contact. Le bouton et la page de devis ont été retirés le 2026-10-17 : on
                écrit ou on appelle depuis `/contact`, dont les coordonnées sont des liens
                natifs — aucun formulaire intermédiaire. */}
        <section className="bg-ink text-paper">
          <div className="container-x py-20 sm:py-28">
            <span className={`${LABEL} text-paper/35`}>{ui.talkToUs}</span>

            <h2 className="mt-6 max-w-[18ch] text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.02] tracking-[-0.03em]">
              {service.ctaTitle}
            </h2>

            <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-paper/55">
              {service.ctaBody}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={href("/contact")}
                className="text-[0.64rem] uppercase tracking-[0.16em] text-paper/50 underline decoration-paper/20 underline-offset-[6px] transition-colors hover:text-paper"
              >
                {dict.finalCta.secondary}
              </Link>
            </div>
          </div>
        </section>

        {/* ——— 6. Les autres fonctionnalités : trois colonnes de cases, la visite continue. */}
        <section className="border-t border-ink/10">
          <div className="container-x py-16 sm:py-20">
            <span className={`${LABEL} text-ink/40`}>{ui.otherServices}</span>

            <ul className="mt-8 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.slug} className="bg-white">
                  <Link
                    href={href(`/services/${other.slug}`)}
                    className="group flex h-full min-h-[9rem] flex-col gap-3 p-6 transition-colors hover:bg-paper/60"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[0.6rem] font-medium tabular-nums tracking-[0.14em] text-ink/35">
                        {num(dict.services.findIndex((s) => s.slug === other.slug))}
                      </span>
                      <ArrowRight className="h-4 w-4 -translate-x-1 text-ink/25 transition-all duration-300 group-hover:translate-x-0 group-hover:text-ink" />
                    </span>

                    <span className="mt-1 text-[1rem] font-light leading-snug text-ink">
                      {other.title}
                    </span>

                    <span className="mt-auto line-clamp-2 text-[0.78rem] leading-relaxed text-ink/50">
                      {other.short}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
