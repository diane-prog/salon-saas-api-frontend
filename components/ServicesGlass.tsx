"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@/components/Icons";
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

/** Positions de la diagonale, desktop : haut-gauche, puis on descend vers la droite. */
const DIAGONAL = ["lg:top-0 lg:left-0", "lg:top-1/3 lg:left-1/2 lg:-translate-x-1/2", "lg:bottom-0 lg:right-0"];

/**
 * Section services, sur le modèle « Your Questions » de qoves.com.
 *
 * Le fond est une vidéo `sticky` de 100vh dont la hauteur est retranchée au flux
 * (`-mb-[100svh]`) : elle reste figée pendant toute la traversée de la section et le
 * contenu défile simplement par-dessus. La section est en `overflow-clip` — un
 * `overflow:hidden` casserait le `sticky`.
 *
 * Deux temps, comme la référence :
 *   1. le titre, puis une grille de trois services alignés sur trois colonnes ;
 *   2. les trois services restants, posés en diagonale sur une hauteur d'écran —
 *      un en haut à gauche, un au centre, un en bas à droite — la vidéo restant
 *      nue entre eux. Un voile flouté très léger se pose sur la vidéo à mesure
 *      qu'on descend, pour accompagner le mouvement sans masquer l'image.
 */
export default function ServicesGlass({ eyebrow, title, body }: ServicesGlassProps) {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;
  const [allowVideo, setAllowVideo] = useState(false);

  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const blur = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);

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

  /* Lecture seulement quand la section est à l'écran : pas de décodage dans le vide. */
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
    const layer = blur.current;
    if (!gap || !layer) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = gap.getBoundingClientRect();
      /* 0 quand l'interstice arrive, 1 quand il est au centre, 0 une fois sorti. */
      const centre = window.innerHeight / 2;
      const dist = Math.abs(rect.top + rect.height / 2 - centre);
      const reach = window.innerHeight / 2 + rect.height / 2;
      layer.style.opacity = String(Math.max(0, 1 - dist / reach));
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
      {/* La vidéo, figée derrière toute la section. */}
      <div className="sticky top-0 -z-10 -mb-[100svh] h-[100svh] bg-black">
        <Image
          src="/img/hero.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {allowVideo && (
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="/img/video2.mp4"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
          />
        )}
        {/* Overlay noir semi-transparent : c'est lui qui garantit la lisibilité. */}
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        {/* Le léger flou qui accompagne le scroll. */}
        <div ref={blur} aria-hidden className="absolute inset-0 bg-black/5 opacity-0 backdrop-blur-[2px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[80rem] border-x border-white/15">
        {/* ---------- 1. Titre + trois services alignés ---------- */}
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

          <ul className="grid border-y border-white/15 sm:grid-cols-3 [&>li+li]:border-t sm:[&>li+li]:border-t-0 sm:[&>li+li]:border-l">
            {top.map((service, index) => (
              <Reveal
                as="li"
                key={service.slug}
                delay={index * 70}
                className="border-white/15 px-1.5 py-5 sm:px-2.5"
              >
                <ServiceCard service={service} href={href(service.slug)} label={ui.viewDetails} />
              </Reveal>
            ))}
          </ul>
        </div>

        {/* ---------- Interstice : la vidéo seule, aucune carte à l'écran ---------- */}
        <div ref={gapRef} aria-hidden className="h-[60vh] sm:h-[75vh]" />

        {/* ---------- 2. Les trois autres, en diagonale ---------- */}
        <div className="relative flex flex-col gap-4 px-5 pb-24 sm:px-8 sm:pb-32 lg:h-[52rem] lg:block lg:overflow-hidden lg:px-10 lg:pb-0">
          {bottom.map((service, index) => (
            <Reveal
              key={service.slug}
              delay={index * 90}
              className={`lg:absolute lg:w-[26rem] ${DIAGONAL[index % DIAGONAL.length]}`}
            >
              <ServiceCard
                service={service}
                href={href(service.slug)}
                label={ui.viewDetails}
                listings
              />
            </Reveal>
          ))}
        </div>

        {/* La course : une demi-page de vidéo nue pour conclure la traversée. */}
        <div aria-hidden className="h-[45vh]" />

        <div className="flex justify-center px-5 pb-28 sm:px-8 sm:pb-36">
          <ButtonLink href={`/${locale}/services`} variant="ghost">
            {ui.viewAllServices}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/**
 * Carte de verre. `listings` reprend la variante basse de la référence : un titre,
 * puis quelques pastilles translucides — ici les prestations du service.
 */
function ServiceCard({
  service,
  href,
  label,
  listings = false,
}: {
  service: Service;
  href: string;
  label: string;
  listings?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={`${service.title} — ${label}`}
      className="group relative flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.11] sm:p-6"
    >
      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-white/45 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />

      {listings ? (
        <>
          <h3 className="max-w-[85%] pr-6 text-2xl font-normal leading-snug [text-shadow:0_2px_12px_rgb(0_0_0_/_0.4)]">
            {service.heroSubtitle}
          </h3>
          <ul className="mt-8 flex flex-col gap-2">
            {service.offerings.slice(0, 4).map((item) => (
              <li
                key={item}
                className="rounded-lg bg-white/[0.07] px-4 py-3 text-sm text-white/80 transition-colors duration-300 group-hover:bg-white/[0.12]"
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <span className="relative block h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-white/10">
            <Image
              src={service.image}
              alt=""
              fill
              sizes="128px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </span>
          <h3 className="mt-6 text-xl font-normal leading-snug [text-shadow:0_2px_12px_rgb(0_0_0_/_0.4)]">
            {service.heroSubtitle}
          </h3>
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/60">{service.short}</p>
        </>
      )}
    </Link>
  );
}