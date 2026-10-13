"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
  /** Contenu posé APRÈS le cadre, pleine largeur : c'est là que se glisse le bloc des
      résultats (`StatsSection`), qui défile sur le média collé après le fondu des plans. */
  children?: ReactNode;
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
 *
 * `children` vient APRÈS le cadre (`max-w-[80rem]`), donc en pleine largeur, et reste dans
 * la section : c'est le quatrième temps, le bloc des résultats. Monté DANS la section pour
 * une raison de mécanique, pas de goût — la vidéo collée a pour repère la boîte de la
 * section, donc tant que le bloc est dedans, le média reste immobile et c'est le bloc qui
 * défile par-dessus. Placé en voisin, il aurait poussé la vidéo du bas.
 *
 * Le passage d'un plan à l'autre est un FONDU, jamais une coupe : une seconde couche de
 * média (affiche `hero7.png` + `video1.mp4`) est posée sur la première, dans le même cadre
 * collé, et son opacité suit la progression du défilement — 0 quand le bloc des résultats
 * pointe au bas de l'écran, 1 quand son haut atteint le haut de l'écran, soit un écran de
 * défilement. Affiche et vidéo forment un même plan : si la vidéo n'est pas encore lancée,
 * on voit l'affiche, jamais un cadre noir.
 *
 * Les deux vidéos ne tournent pas ensemble pour rien : celle des services s'arrête quand le
 * fondu l'a recouverte, celle des résultats ne démarre qu'une fois le fondu commencé (la
 * règle est dans `syncVideo`, les deux booléens évitent d'appeler `play()` à chaque frame).
 * Sous `prefers-reduced-motion`, aucun média ne tourne : la couche change de plan à
 * mi-course, sans fondu continu.
 */
export default function ServicesGlass({ eyebrow, title, body, children }: ServicesGlassProps) {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;
  const [allowVideo, setAllowVideo] = useState(false);

  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  /* Le bloc des résultats (`children`), la couche de plan qui le remplace au fondu, et sa
     vidéo. Plus l'état de lecture des deux plans et la progression du fondu (0 → 1). */
  const resultsBeat = useRef<HTMLDivElement>(null);
  const resultsLayer = useRef<HTMLDivElement>(null);
  const resultsVideo = useRef<HTMLVideoElement>(null);
  const progress = useRef(0);
  const inView = useRef(false);
  const playing = useRef({ services: false, results: false });

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

  /* Qui tourne, et quand. Une seule règle pour les deux plans :

     - celui des SERVICES tourne tant que la section est dans le champ et que le fondu ne
       l'a pas recouvert (`p < 0.985`) ;
     - celui des RÉSULTATS ne démarre qu'une fois le fondu engagé (`p > 0.015`).

     Sans les deux booléens, on appellerait `play()`/`pause()` à chaque frame — inutile et
     coûteux ; ils limitent les appels aux VRAIS changements d'état. */
  const syncVideo = useCallback(() => {
    const media = video.current;
    const results = resultsVideo.current;
    const p = progress.current;
    const wantServices = inView.current && p < 0.985;
    const wantResults = inView.current && p > 0.015;

    if (media && wantServices !== playing.current.services) {
      playing.current.services = wantServices;
      if (wantServices) void media.play().catch(() => {});
      else media.pause();
    }

    if (results && wantResults !== playing.current.results) {
      playing.current.results = wantResults;
      if (wantResults) void results.play().catch(() => {});
      else results.pause();
    }
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!allowVideo || !el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        syncVideo();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [allowVideo, syncVideo]);

  /* Deux choses sont pilotées par le défilement, dans le même écouteur :

     1. le voile flouté, qui se pose sur la vidéo pendant l'interstice puis se retire ;
     2. le FONDU des plans — quand le bloc des résultats monte, le plan des services cède
        la place à celui des résultats progressivement (`opacity` de la couche), au lieu
        d'un changement sec. La progression vaut 0 quand le bloc pointe au bas de l'écran
        et 1 quand son haut atteint le haut de l'écran : un écran de défilement, pas plus.

     Les deux mesures sont faites dans la même frame (`requestAnimationFrame`), jamais
     dans deux écouteurs : elles lisent le même layout, une seule passe de recalcul. */
  useEffect(() => {
    const gap = gapRef.current;
    const veil = blurRef.current;
    const layer = resultsLayer.current;
    const beat = resultsBeat.current;
    if (!gap || !veil || !layer || !beat) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const view = window.innerHeight;

      const rect = gap.getBoundingClientRect();
      /* 0 quand l'interstice arrive, 1 quand il est au centre, 0 une fois sorti. */
      const centre = view / 2;
      const dist = Math.abs(rect.top + rect.height / 2 - centre);
      const reach = view / 2 + rect.height / 2;
      veil.style.opacity = String(Math.max(0, 1 - dist / reach));

      /* Le fondu des plans. Sous `prefers-reduced-motion`, pas de fondu continu : on
         bascule à mi-course — `allowVideo` est faux exactement dans ce cas. Le plan
         change, mais rien ne glisse. */
      const raw = Math.min(1, Math.max(0, 1 - beat.getBoundingClientRect().top / view));
      const p = allowVideo ? raw : raw > 0.5 ? 1 : 0;
      progress.current = p;
      layer.style.opacity = String(p);
      syncVideo();
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
  }, [allowVideo, syncVideo]);

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

        {/* 2. Le plan des RÉSULTATS : posé par-dessus le plan des services, dans le même
            cadre collé. Son opacité est celle du défilement (voir plus bas) — c'est le
            fondu, pas un changement de plan.

            Il est monté EN DERNIER dans le média, donc au-dessus des deux voiles des
            services : une fois le fondu terminé, plus rien ne voile ni ne floute le
            nouveau plan. Affiche (`hero7.png`) et vidéo (`video1.mp4`) sont le même plan
            chaud, donc rien ne sursaute si la vidéo n'est pas encore lancée. */}
        <div ref={resultsLayer} aria-hidden className="absolute inset-0 opacity-0">
          <Image
            src="/img/hero7.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          {allowVideo && (
            <video
              ref={resultsVideo}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src="/img/video1.mp4"
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              tabIndex={-1}
            />
          )}
          <div className="absolute inset-0 bg-ink/55" />
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink/85 via-ink/45 to-transparent lg:w-[64%]" />
        </div>
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

      {/* 4. Le bloc des résultats : dans la section, donc il défile PAR-DESSUS le cadre
          collé dont le plan vient de changer. Sa position pilote le fondu (voir l'effet
          plus haut) ; son contenu s'anime de son côté (`Reveal`, `SplitText`). */}
      <div ref={resultsBeat} className="relative">
        {children}
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