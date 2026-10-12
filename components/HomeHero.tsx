"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import SplitText from "@/components/SplitText";
import { ButtonLink } from "@/components/ui";
import HeroSearch from "@/components/HeroSearch";
import { useDictionary } from "@/components/DictionaryProvider";

export default function HomeHero() {
  const { dict, locale } = useDictionary();
  const { hero, ui } = dict;
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const [allowVideo, setAllowVideo] = useState(false);

  // Vidéo de fond chargée uniquement si l'utilisateur n'a pas demandé moins d'animations.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowVideo(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className="relative isolate flex min-h-[92vh] border-b border-gray-100 flex-col overflow-hidden bg-navy-deep pt-32 pb-10 sm:pt-40 sm:pb-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Cadre plus haut que le hero : le média peut glisser sans découvrir les bords. */}
        <Parallax className="absolute -inset-y-[9%] inset-x-0" amount={5} scale={1.06}>
          <Image
            src="/img/hero3.png"
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />

          {allowVideo && (
            <video
              className="absolute inset-0 h-full w-full object-cover object-center"
              src="/img/video-d.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              tabIndex={-1}
            />
          )}
        </Parallax>

        {/* Léger voile noir sur la vidéo : le titre tient mieux sur n'importe quel plan,
            l'image reste lisible. Il se place SOUS l'ensemble blanc du bas (le fondu
            vers la section suivante est un frère plus loin dans le DOM) donc celui-ci
            reste intact. */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Overlay blanc en bas du hero : la photo se fond dans la section blanche suivante. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:h-20"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-5 md:px-8 xl:px-10">
        <div className="flex max-w-3xl flex-1 flex-col justify-center">
          <Reveal className="flex flex-col items-start gap-6">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)]">
              {ui.agency}
            </span>

            <SplitText
              as="h1"
              text={hero.lead}
              delay={0.12}
              stagger={0.06}
              className="max-w-3xl font-normal text-4xl leading-[1.06] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-5xl lg:text-[4.25rem] lg:leading-[1.02]"
            />

            <p className="max-w-xl text-base leading-relaxed text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-lg">
              {hero.body}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              {/* Pastille blanche (comme le CTA de la référence) : le variant `outline`
                  est le seul qui n'a PAS de `bg-gradient-*` — un simple `bg-white` posé
                  sur `primary` serait masqué par l'image de fond du dégradé. */}
              <ButtonLink href={href("/devis")} variant="outline">
                {ui.freeQuote}
              </ButtonLink>
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

        <div className="mt-12 flex justify-center">
          {/* <HeroSearch /> */}
        </div>
      </div>
    </section>
  );
}
