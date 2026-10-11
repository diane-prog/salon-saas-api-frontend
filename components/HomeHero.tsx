"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";

export default function HomeHero() {
  const { dict, locale } = useDictionary();
  const { hero, ui } = dict;
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const highlights = dict.services.slice(0, 3);

  return (
    <section className="relative isolate flex min-h-[92vh] flex-col overflow-hidden bg-navy-deep pt-32 pb-10 sm:pt-40 sm:pb-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/img/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-5 md:px-8 xl:px-10">
        <div className="flex max-w-3xl flex-1 flex-col justify-center">
          <Reveal className="flex flex-col items-start gap-6">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)]">
              {ui.agency}
            </span>

            <h1 className="max-w-3xl text-4xl leading-[1.06] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-5xl lg:text-[4.25rem] lg:leading-[1.02]">
              {hero.lead}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/85 [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-lg">
              {hero.body}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <ButtonLink href={href("/devis")}>{ui.freeQuote}</ButtonLink>
              <Link
                href={href("/realisations")}
                aria-label={ui.viewAllProjects}
                className="grid h-[3.35rem] w-[3.35rem] shrink-0 place-items-center rounded-full bg-white text-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {highlights.map((s, i) => (
            <Reveal key={s.slug} delay={i * 90}>
              <Link
                href={href(`/services/${s.slug}`)}
                className="flex h-full flex-col rounded-card bg-white px-5 py-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-navy">
                  {s.title}
                </span>
                <span className="mt-1 line-clamp-1 text-xs text-muted">{s.short}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
