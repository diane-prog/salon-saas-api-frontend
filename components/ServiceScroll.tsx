"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ServiceScrollProps = {
  eyebrow: string;
  title: string;
  body: string;
};

/**
 * Section services : le scroll vertical fait défiler la piste horizontalement.
 *
 * Reprise à l'identique de la section « Parcours » d'anne-folio : une seule piste
 * contient l'intro ET les cartes, la section se fige et la piste glisse — l'intro
 * sort par la gauche pendant que les cartes traversent l'écran.
 *
 * Mobile / mouvement réduit : aucune épingle, les cartes s'empilent en `sticky` sous
 * l'en-tête et la section ne clippe pas (`overflow-hidden` en md uniquement), sinon
 * `sticky` ne prend pas.
 */
export default function ServiceScroll({ eyebrow, title, body }: ServiceScrollProps) {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;
  const href = (slug: string) => `/${locale}/services/${slug}`;

  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* Desktop : la section s'épingle et le scroll vertical fait défiler la piste
         qui contient l'intro ET les cartes. */
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const dist = () => Math.max(0, track.scrollWidth - el.clientWidth);

        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${dist() + window.innerHeight * 0.5}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      /* Mobile / mouvement réduit : pas d'épingle, la piste défile normalement
         avec l'intro comme premier élément. */
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(track, { clearProps: "transform" });
      });
    }, el);

    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={root}
      className="border-t border-navy/[0.06] bg-navy/[0.02] py-16 text-navy md:h-screen md:overflow-hidden md:py-0"
    >
      <div className="flex h-full flex-col justify-center">
        {/* Mobile : deck vertical — chaque carte se fige sous l'en-tête et la suivante
            passe par-dessus. Desktop : une seule rangée défilée par l'épingle. */}
        <div
          ref={trackRef}
          className="flex w-full flex-col gap-6 md:h-[72vh] md:w-max md:flex-row md:items-center md:gap-16"
          style={{ paddingInline: "max(1.25rem, calc((100vw - 80rem)/2 + 2.5rem))" }}
        >
          <div className="w-full shrink-0 md:w-[34vw] md:max-w-[520px]">
            <p className="flex items-center gap-3 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-muted">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              {eyebrow}
            </p>
            <h2 className="mt-6 text-[clamp(2rem,4.6vw,4.25rem)] font-semibold leading-[1.04] tracking-tight text-navy">
              {title}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">{body}</p>
          </div>

          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={index}
              href={href(service.slug)}
              label={ui.viewDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  href,
  label,
}: {
  service: Service;
  index: number;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{ top: `calc(var(--header-h, 4.5rem) + ${index * 0.6}rem)` }}
      className="group sticky top-6 flex h-auto w-full shrink-0 flex-col rounded-lg border border-line bg-white p-7 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] md:static md:h-full md:w-[420px] md:max-w-[420px] md:shadow-none"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-muted">
          {service.title}
        </p>
        <span className="text-[0.625rem] tracking-[0.14em] text-muted/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-tight text-navy md:text-[1.75rem]">
        {service.heroSubtitle}
      </h3>

      <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm leading-relaxed text-muted">
        {service.offerings.slice(0, 4).map((offering) => (
          <li key={offering} className="relative pl-5">
            <span aria-hidden className="absolute left-0 top-[0.6em] block h-1 w-1 rounded-full bg-brand/50" />
            {offering}
          </li>
        ))}
      </ul>

      <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-brand">
        {label}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
