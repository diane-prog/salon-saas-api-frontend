"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Quote, serviceIcons } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";

export function HeroSection({
  eyebrow,
  title,
  highlight,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy grain pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-[26rem] w-[26rem] rounded-full bg-brand/35 blur-[120px] animate-drift" />
        <div className="absolute -right-24 top-10 h-[22rem] w-[22rem] rounded-full bg-turquoise/25 blur-[120px] animate-drift" style={{ animationDelay: "-9s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(36,151,190,0.18),transparent_65%)]" />
      </div>

      <div className="container-x relative">
        <div className="flex max-w-4xl flex-col items-start gap-7">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[1.04]">
            {title} {highlight && <span className="text-gradient">{highlight}</span>}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{body}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export function KeywordMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-white/10 bg-navy-deep/40 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy to-transparent" />
      <div className="flex shrink-0 animate-marquee items-center gap-10 whitespace-nowrap pr-10">
        {row.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-10 text-sm font-medium uppercase tracking-[0.22em] text-white/35">
            {word}
            <span className="h-1.5 w-1.5 rounded-full bg-turquoise/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatsSection({ stats }: { stats: { value: number; suffix: string; label: string }[] }) {
  return (
    <section className="relative overflow-hidden border-b border-navy/8 bg-white">
      <div className="container-x">
        <ul className="grid grid-cols-2 divide-navy/8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
          {stats.map((s, i) => (
            <Reveal
              as="li"
              key={s.label}
              delay={i * 80}
              className="flex flex-col items-center gap-2 px-4 py-10 text-center"
            >
              <span className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted">{s.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ServiceGrid() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dict.services.map((s, i) => {
        const Icon = serviceIcons[s.slug as keyof typeof serviceIcons];
        return (
          <Reveal as="li" key={s.slug} delay={i * 70} className="h-full">
            <Link
              href={href(`/services/${s.slug}`)}
              className="glow-card group flex h-full flex-col gap-4 bg-white p-7 shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-turquoise text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
                {Icon && <Icon />}
              </span>
              <h3 className="text-lg font-semibold text-navy">{s.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted">{s.short}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                {dict.ui.viewDetails}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

export function ProjectGrid({ projects }: { projects: { title: string; body: string; category: string; image: string }[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <Reveal as="li" key={p.title} delay={i * 70} className="h-full">
          <article className="glow-card group flex h-full flex-col overflow-hidden bg-white shadow-soft">
            <div className="relative aspect-[4/3] overflow-hidden bg-navy/5">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-navy backdrop-blur">
                {p.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="text-base font-semibold leading-snug text-navy">{p.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

export function TestimonialsSection() {
  const { dict } = useDictionary();

  return (
    <section className="relative overflow-hidden bg-navy grain py-24 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-turquoise/20 blur-[110px] animate-drift" />
      </div>

      <div className="container-x relative">
        <SectionHeading tone="dark" eyebrow={dict.ui.top} title={dict.ui.testimonialTitle} body={dict.ui.testimonialBody} />

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {dict.testimonials.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 80}>
              <figure className="flex h-full flex-col gap-5 rounded-card border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors duration-300 hover:border-turquoise/40 hover:bg-white/[0.07]">
                <Quote className="text-turquoise/50" />
                <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-slate-200">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-4 border-t border-white/10 pt-5">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-turquoise/40"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">
                      {t.role} — {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClientsMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-navy/8 bg-navy/[0.02] py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="flex shrink-0 animate-marquee-slow items-center gap-16 whitespace-nowrap pr-16">
        {row.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-2xl font-bold uppercase tracking-tight text-navy/25 transition-colors hover:text-navy/50"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SplitShowcase({
  eyebrow,
  title,
  body,
  points,
  image,
  imageAlt,
  href,
  ctaLabel,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  image: string;
  imageAlt: string;
  href?: string;
  ctaLabel?: string;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-3xl leading-[1.15] text-navy sm:text-4xl">{title}</h2>
          <p className="text-base leading-relaxed text-muted">{body}</p>
          {points && (
            <ul className="mt-1 grid gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm font-medium text-navy">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          {href && ctaLabel && (
            <ButtonLink href={href} variant="outline" className="mt-3">
              {ctaLabel}
            </ButtonLink>
          )}
        </div>
      </Reveal>

      <Reveal delay={120} className={reverse ? "lg:order-1" : ""}>
        <div className="relative">
          <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand/15 to-turquoise/15 blur-2xl" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] shadow-lift">
            <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-turquoise"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}