"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { HeroSection } from "@/components/sections";
import { ButtonLink, CheckList, SectionHeading } from "@/components/ui";
import { ArrowRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";

export default function ServicePageTemplate({ service }: { service: Service }) {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const others = dict.services.filter((s) => s.slug !== service.slug);
  const ui = dict.ui;

  return (
    <>
      {/* Hero clair commun à toutes les pages internes (photo `other-hero` en fond). */}
      <HeroSection eyebrow="Service" title={service.heroTitle} body={service.heroSubtitle}>
        <ButtonLink href={href("/devis")} className="mt-2">
          {ui.freeQuote === "Devis gratuit" ? "Demander un devis" : "Get a quote"}
        </ButtonLink>
      </HeroSection>

      <section className="py-24 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="flex flex-col items-start gap-4 lg:sticky lg:top-28">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-brand">{ui.presentation}</span>
              <SplitText
                as="h2"
                text={service.whyTitle}
                className="text-3xl leading-[1.15] text-navy sm:text-4xl"
              />
              <div aria-hidden className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-brand to-turquoise" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-col gap-8">
              <p className="text-base leading-[1.85] text-muted sm:text-lg">{service.whyBody}</p>
              <ButtonLink href={href("/devis")} variant="outline">
                {ui.freeQuote === "Devis gratuit" ? "Demander un devis" : "Get a quote"}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy grain py-24 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-turquoise/20 blur-[110px] animate-drift" />
        </div>
        <div className="container-x relative">
          <SectionHeading tone="dark" eyebrow={ui.ourOffer} title={locale === "fr" ? "Ce que nous proposons" : "What we offer"} />
          <div className="mt-14">
            <Reveal>
              <CheckList items={service.offerings} tone="dark" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={ui.methodology} title={service.processLabel} body={service.processIntro} />

          <ol className="mt-16 grid gap-y-10 md:grid-cols-4 md:gap-x-6">
            {service.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 90} className="relative md:pr-6">
                <div className="relative flex items-center md:block">
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-sm font-light text-white shadow-soft">
                    {i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="hidden h-px w-full bg-gradient-to-r from-brand/40 to-transparent md:ml-3 md:block md:h-px"
                  />
                </div>
                <h3 className="mt-4 text-lg font-light text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy/[0.03] py-24 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-turquoise/30 to-transparent" />
        <div className="container-x">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <SplitText
              as="h2"
              text={service.ctaTitle}
              className="text-3xl leading-[1.12] text-navy sm:text-4xl"
            />
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{service.ctaBody}</p>
            <ButtonLink href={href("/devis")} className="mt-2">
              {ui.discussProject}
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-navy/8 py-20">
        <div className="container-x">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {locale === "fr" ? "Autres services" : "Other services"}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={href(`/services/${s.slug}`)}
                  className="group flex h-full flex-col gap-2 rounded-card border border-navy/8 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="text-sm font-light leading-snug text-navy">{s.title}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-light text-brand">
                    {ui.discover}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}