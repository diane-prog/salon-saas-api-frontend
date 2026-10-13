"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, serviceIcons } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import Parallax from "@/components/Parallax";
import Counter from "@/components/Counter";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { prefersReducedMotion } from "@/lib/motion";
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
          <SplitText
            as="h1"
            text={title}
            accent={highlight}
            accentClassName="text-gradient"
            delay={0.08}
            className="text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[1.04]"
          />
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
              <span className="text-3xl font-light tracking-tight text-navy sm:text-4xl">
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
              className="group flex h-full flex-col gap-4 rounded-lg border border-line bg-white p-7 shadow-soft transition-shadow duration-300 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-turquoise text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
                {Icon && <Icon />}
              </span>
              <h3 className="text-lg font-light text-navy">{s.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted">{s.short}</p>
              <span className="inline-flex items-center gap-2 text-sm font-light text-brand">
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

/**
 * Témoignages clients, style « Trusted by Clients » de la référence :
 *
 * - fonds noir, en-tête à gauche + deux flèches rondes à droite ;
 * - cartes dark avec DOUBLE COUCHE : une ombre plein-cadre décalée sous chaque carte
 *   (les captures montrent la carte répétée en dessous, plus foncée) ;
 * - fleur à la couleur brand au centre-bas avec « CLIENT STORIES » ; au scroll elle S'AGRANDIT
 *   jusqu'à couvrir le bas de la section (le libellé grossit avec elle) — l'échelle
 *   dérive de la position de la section dans le viewport, pas d'un timer ;
 *   à la remontée la progression redescend, donc la fleur RÉTRÉCIT et retrouve sa
 *   taille de repos une fois la section revenue en bas du viewport ;
 * - mouvement réduit : la fleur reste à sa taille de repos, tout reste lisible.
 */
export function TestimonialsSection() {
  const { dict } = useDictionary();
  const root = useRef<HTMLElement>(null);
  /* Valeur lissée de la progression, persistée entre les frames (lerp). */
  const smoothed = useRef(0);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const blob = section.querySelector<HTMLElement>("[data-stories-blob]");
    const label = section.querySelector<HTMLElement>("[data-stories-label]");
    /* La MESURE se fait sur le conteneur, jamais sur la fleur : le rect d'un
       élément transformé est renvoyé DÉJÀ transformé. En lisant `blob`, un
       scale(18) remontait son `top` de ~1200 px et la progression restait
       bloquée à 1 à la remontée (la fleur ne rétrécissait plus). Le conteneur,
       lui, n'est jamais transformé : sa position reflète le layout réel. */
    const anchor = section.querySelector<HTMLElement>("[data-stories-anchor]");
    if (!blob || !label || !anchor) return;

    /* Échelle finale ciblée : la fleur doit couvrir LE BAS DE LA SECTION — pas
       l'écran entier. La hauteur de la zone basse ≈ 16rem (badge + paddings) ; la
       fleur de 9rem doit faire ~160rem de large pour couvrir tous les angles de
       cette bande : scale final 18 suffit, on reste sobre. */
    const update = () => {
      const badge = anchor.getBoundingClientRect();
      const view = window.innerHeight;
      const startLine = view * 0.6;
      const endLine = view * 0.05;
      /* Parcours du badge entre les deux lignes — ET lissage : le progress brut est
         adouci par une courbe easeOut (démarrage doux, fin douce), puis lissé à
         nouveau par un amorti temporel (lerp) : le mouvement est CONTINU, plus de
         sauts brutal quand on scrolle vite. À la remontée, la valeur suit et
         redéscend progressivement — le retour est symétrique. */
      const travelled = startLine - badge.top;
      const total = startLine - endLine;
      const raw = Math.min(1, Math.max(0, travelled / total));
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(2 - 2 * raw, 2) / 2;
      /* Lerp : on ne saute jamais à la nouvelle valeur, on glisse vers elle. */
      smoothed.current += (eased - smoothed.current) * 0.16;
      if (Math.abs(eased - smoothed.current) < 0.001) smoothed.current = eased;
      const progress = smoothed.current;
      const scale = 1 + progress * 17;
      blob.style.transform = `scale(${scale}) rotate(${progress * 180}deg)`;
      /* Pas de translate ici : en Tailwind v4, `-translate-x-1/2 -translate-y-1/2`
         s'applique via la propriété `translate` (indépendante de `transform`),
         donc le centrage du libellé survit à ce transform — le dupliquer ici
         décalait le texte de ~41 px. */
      label.style.transform = `scale(${1 + progress * 7})`;
    };
    /* Lenis pilote la page via des transforms : l'événement `scroll` natif n'est pas
       fiable ici. On rafraîchit donc en boucle rAF — la mesure est ainsi toujours à
       jour, dans les deux sens (descente ET remontée). */
    let stopRequested = false;
    const tick = () => {
      if (stopRequested) return;
      update();
      window.requestAnimationFrame(tick);
    };
    if (prefersReducedMotion()) {
      return;
    }
    window.requestAnimationFrame(tick);
    return () => {
      stopRequested = true;
    };
  }, []);

  const arrow = (d: string, flip = false) => (
    <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors duration-300 hover:border-white/60 hover:text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${flip ? "scale-x-[-1]" : ""}`}
        aria-hidden
      >
        <path d={d} />
      </svg>
    </span>
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-black py-24 sm:py-28"
    >
      <div className="container-x relative z-10">
        {/* En-tête : titre + sous-titre à gauche, flèches rondes à droite. */}
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-light tracking-tight text-white sm:text-5xl">
              {dict.ui.testimonialTitle}
            </h2>
            <p className="mt-3 text-sm text-white/50">{dict.ui.testimonialBody}</p>
          </div>
          <div className="hidden shrink-0 gap-3 sm:flex">
            {arrow("M14 6l-6 6 6 6", true)}
            {arrow("M10 6l6 6-6 6")}
          </div>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.testimonials.slice(0, 3).map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 80} className="relative">
              {/* Double couche : la carte est posée sur une copie décalée plus basse. */}
              <div
                aria-hidden
                className="absolute inset-x-4 top-6 bottom-0 -z-0 rounded-card bg-[#181818]"
              />
              <figure className="relative flex h-full flex-col gap-5 rounded-card border border-white/5 bg-[#1c1c1c] p-7">
                <div className="flex items-start justify-between gap-3">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={52}
                    height={52}
                    className="h-13 w-13 rounded-lg object-cover"
                  />
                  <span className="mt-1 text-[0.7rem] font-light uppercase tracking-[0.14em] text-white/70">
                    {dict.clients[i % dict.clients.length]}
                  </span>
                </div>

                <blockquote className="text-[1.05rem] leading-relaxed text-white/90">
                  “{t.quote}”
                </blockquote>

                {/* Étoiles orange, seules teintes de la carte, comme la référence. */}
                <div className="flex gap-1" aria-hidden>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="h-4 w-4 fill-orange" >
                      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
                    </svg>
                  ))}
                </div>

                <div aria-hidden className="mt-2 h-px w-8 bg-white/25" />
                <figcaption>
                  <p className="text-base font-light text-white">{t.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    {t.role}
                    <br />
                    {t.company}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Le badge : fleur + texte, comme Orisa. EN FLUX NORMAL après les cartes — le
          petit cercle est VISIBLE au repos (le bug signalé : il était caché sous les
          cartes via une marge négative, retirée). Deux points-clés d'Orisa conservés :
          1) badge à z-index inférieur — quand il grossit, le fond brand passe derrière les
          cartes déjà scrollées hors champ, jamais devant ;
          2) la section clippe : à fin de course le brand couvre le bas, le noir avalé. */}
      <div data-stories-anchor className="relative z-0 mt-14 flex justify-center pb-24">
        <div data-stories-blob className="flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="h-36 w-36 fill-brand"
            style={{ willChange: "transform" }}
            aria-hidden
          >
            <path d="M100 22c15 0 24 10 30 18 10-3 22-1 28 10 6 10 2 22-5 29 7 7 11 19 5 29-6 11-18 13-28 10-6 8-15 18-30 18s-24-10-30-18c-10 3-22 1-28-10-6-10-2-22 5-29-7-7-11-19-5-29 6-11 18-13 28-10 6-8 15-18 30-18Z" />
          </svg>
        </div>
        <span
          data-stories-label
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-light uppercase leading-[1.02] tracking-tight text-white"
          style={{ fontSize: "1.4rem", willChange: "transform" }}
        >
          Client
          <br />
          Stories
        </span>
      </div>
    </section>
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
          <SplitText
            as="h2"
            text={title}
            className="text-3xl leading-[1.15] text-navy sm:text-4xl"
          />
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
            <Parallax className="absolute inset-0" amount={6} scale={1.1}>
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </Parallax>
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
      className="group inline-flex items-center gap-2 text-sm font-light text-brand transition-colors hover:text-turquoise"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}