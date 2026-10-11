"use client";

import { ButtonLink } from "@/components/ui";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";

export default function CtaBand() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const { finalCta } = dict;

  return (
    <section className="relative overflow-hidden bg-navy grain">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brand/30 blur-[100px] animate-drift" />
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-turquoise/25 blur-[110px] animate-drift" style={{ animationDelay: "-8s" }} />
      </div>

      <div className="container-x relative py-24 sm:py-32">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-turquoise">
            {dict.ui.talkToUs}
          </span>
          <h2 className="text-3xl leading-[1.12] text-white sm:text-4xl lg:text-[2.75rem]">
            {finalCta.title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {finalCta.body}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={href("/devis")} variant="primary">
              {finalCta.primary}
            </ButtonLink>
            <ButtonLink href={href("/contact")} variant="ghost">
              {finalCta.secondary}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}