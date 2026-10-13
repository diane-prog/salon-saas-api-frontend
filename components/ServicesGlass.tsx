"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, serviceIcons } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";

type ServicesGlassProps = {
  eyebrow: string;
  title: string;
  body: string;
};

const TOP_COUNT = 3;

/**
 * Section services — la vidéo, puis deux vagues de trois services.
 *
 * La vidéo est collée en haut et sa hauteur est retranchée au flux (`-mb-[100svh]`) :
 * elle ne bouge jamais, tout le reste défile par-dessus. La section est en
 * `overflow-clip` — un `overflow:hidden` casserait le `sticky`.
 *
 *   1. le titre puis trois services alignés sur trois colonnes ;
 *   2. un interstice où la vidéo reste seule à l'écran ;
 *   3. les trois services restants, sur la même grille. Un voile flouté se pose
 *      sur la vidéo pendant l'interstice et se retire ensuite.
 */
export default function ServicesGlass({ eyebrow, title, body }: ServicesGlassProps) {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;
  const [allowVideo, setAllowVideo] = useState(false);

  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  const top = services.slice(0, TOP_COUNT);
  const bottom = services.slice(TOP_COUNT);
  const href = (slug: string) => `/${locale}/services/${slug}`;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowVideo(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = root.current;
    const media = video.current;
    if (!allowVideo || !el || !media) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void media.play().catch(() => {});
        else media.pause();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [allowVideo]);

  /* Le voile flouté se pose sur la vidéo pendant l'interstice, puis se retire. */
  useEffect(() => {
    const gap = gapRef.current;
    const veil = blurRef.current;
    if (!gap || !veil) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = gap.getBoundingClientRect();
      /* 0 quand l'interstice arrive, 1 quand il est au centre, 0 une fois sorti. */
      const centre = window.innerHeight / 2;
      const dist = Math.abs(rect.top + rect.height / 2 - centre);
      const reach = window.innerHeight / 2 + rect.height / 2;
      veil.style.opacity = String(Math.max(0, 1 - dist / reach));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={root} className="relative isolate overflow-clip text-white">
      {/* 1. La vidéo : figée, elle ne fait pas partie du flux. */}
      <div className="sticky top-0 -z-10 -mb-[100svh] h-[100svh] bg-black">
        <Image
          src="/img/hero4.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {allowVideo && (
          <video
            ref={video}
            /* Même raisonnement que le hero de l'accueil, avec les mesures de CE plan :
               en 16:9 dans un écran portrait, on n'en voit qu'une tranche de ~26 % de large.
               Ici la peau est centrée sur 65 % du plan et la tranche la plus fournie
               commence vers 51 % : `object-position` à `51 / 74 ≈ 68 %` place les personnes
               au milieu de l'écran au lieu de les laisser au bord droit.

               Sur téléphone seulement : l'écran large étant plus large que haut, la vidéo
               s'y cadre en `cover` sans perdre de champ horizontal, et la valeur centrée
               d'origine reste la bonne. */
            className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center"
            src="/img/videoo.mp4"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        {/* Le voile flouté, piloté par l'interstice plus bas. */}
        <div
          ref={blurRef}
          aria-hidden
          className="absolute inset-0 bg-black/5 opacity-0 backdrop-blur-[1px]"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[80rem] border-x border-white/15">
        {/* 1. Titre + trois services alignés. */}
        <div className="flex min-h-[100svh] flex-col justify-end">
          <div className="max-w-2xl px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-40 lg:px-10">
            <Eyebrow tone="dark">{eyebrow}</Eyebrow>
            <SplitText
              as="h2"
              text={title}
              delay={0.05}
              className="mt-6 text-4xl leading-[1.05] [text-shadow:0_2px_18px_rgb(0_0_0_/_0.4)] sm:text-5xl lg:text-[3.5rem]"
            />
            <p className="mt-6 text-base leading-relaxed text-white/70">{body}</p>
          </div>

          <ul className="grid border-y border-white/15 sm:grid-cols-3">
            {top.map((service, index) => (
              <Reveal
                as="li"
                key={service.slug}
                delay={index * 70}
                className={`border-white/15 px-1.5 py-5 sm:px-2.5 ${index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`}
              >
                <ServiceCard service={service} href={href(service.slug)} label={ui.viewDetails} />
              </Reveal>
            ))}
          </ul>
        </div>

        {/* 2. Interstice d'un plein écran : la vague 1 est entièrement sortie
            du champ quand la vague 2 entre.

            Sur un téléphone, ce plein écran de vidéo nue devient un long moment où rien
            ne se passe : la hauteur est donc réduite sous `sm`, la respiration reste
            visible sans faire attendre. */}
        <div ref={gapRef} aria-hidden className="h-[42svh] sm:h-[100svh]" />

        {/* 3. Les trois autres : même grille que la première vague. */}
        <ul className="grid border-y border-white/15 sm:grid-cols-3">
          {bottom.map((service, index) => (
            <Reveal
              as="li"
              key={service.slug}
              delay={index * 70}
              className={`border-white/15 px-1.5 py-5 sm:px-2.5 ${index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`}
            >
              <ServiceCard service={service} href={href(service.slug)} label={ui.viewDetails} />
            </Reveal>
          ))}
        </ul>

        {/* La course : une demi-page de vidéo nue pour conclure la traversée (plus courte
            sur un téléphone, même raison que l'interstice ci-dessus). */}
        <div aria-hidden className="h-[26svh] sm:h-[45vh]" />

        <div className="flex justify-center px-5 pb-28 sm:px-8 sm:pb-36">
          <ButtonLink href={`/${locale}/services`} variant="ghost">
            {ui.viewAllServices}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** Carte de verre. `listings` ajoute les prestations sous le titre. */
function ServiceCard({
  service,
  href,
  label,
}: {
  service: Service;
  href: string;
  label: string;
}) {
  const Icon = serviceIcons[service.slug as keyof typeof serviceIcons];

  return (
    <Link
      href={href}
      aria-label={`${service.title} — ${label}`}
      className="group relative flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.11] sm:p-6"
    >
      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-white/45 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />

      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition-colors duration-300 group-hover:border-white/30">
          <Icon className="h-5 w-5" />
        </span>
      )}

      <h3 className="mt-6 text-xl font-normal leading-snug [text-shadow:0_2px_12px_rgb(0_0_0_/_0.4)]">
        {service.title}
      </h3>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/60">{service.short}</p>
    </Link>
  );
}