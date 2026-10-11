"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { ButtonLink, CheckList, Eyebrow, SectionHeading } from "@/components/ui";
import { ArrowRight, serviceIcons } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";

export default function ServicePageTemplate({ service }: { service: Service }) {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const Icon = serviceIcons[service.slug as keyof typeof serviceIcons];
  const others = dict.services.filter((s) => s.slug !== service.slug);
  const ui = dict.ui;

  return (
    <>
      <section className="relative overflow-hidden bg-navy grain pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 -top-24 h-96 w-96 rounded-full bg-brand/35 blur-[120px] animate-drift" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-turquoise/22 blur-[110px] animate-drift" style={{ animationDelay: "-7s" }} />
        </div>

        <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-7">
            <Eyebrow tone="dark">{locale === "fr" ? "Service" : "Service"}</Eyebrow>
            <div className="flex items-center gap-4">
              {Icon && (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-turquoise text-white shadow-soft">
                  <Icon className="h-6 w-6" />
                </span>
              )}
              <h1 className="text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                {service.heroTitle}
              </h1>
            </div>
            <p className="max-w-xl text-lg font-medium text-turquoise sm:text-xl">{service.heroSubtitle}</p>
            <ButtonLink href={href("/devis")}>{ui.freeQuote === "Devis gratuit" ? "Demander un devis" : "Get a quote"}</ButtonLink>
          </div>

          <Reveal delay={140}>
            <div className="relative">
              <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand/25 to-turquoise/25 blur-2xl" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] shadow-lift ring-1 ring-white/10">
                <Image
                  src={service.image}
                  alt={service.heroTitle}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="flex flex-col items-start gap-4 lg:sticky lg:top-28">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-brand">{ui.presentation}</span>
              <h2 className="text-3xl leading-[1.15] text-navy sm:text-4xl">{service.whyTitle}</h2>
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
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-sm font-bold text-white shadow-soft">
                    {i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="hidden h-px w-full bg-gradient-to-r from-brand/40 to-transparent md:ml-3 md:block md:h-px"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy">{step.title}</h3>
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
            <h2 className="text-3xl leading-[1.12] text-navy sm:text-4xl">{service.ctaTitle}</h2>
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
                  <span className="text-sm font-semibold leading-snug text-navy">{s.title}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-brand">
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