"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import RotatingWord from "@/components/RotatingWord";
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
            src="/img/hero-o.png"
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />

          {allowVideo && (
            <video
              /* Le cadrage du plan n'est PAS centré sur téléphone, et la valeur n'est pas
                 choisie à l'œil : le plan est en 16:9 (1280 × 720) et l'écran d'un téléphone
                 est en portrait, donc en `cover` on n'en voit qu'une tranche de ~26 % de
                 large. Images sorties de la vidéo et comptées : la peau est centrée sur
                 73 % de la largeur du plan, et la tranche qui en contient le plus commence
                 à 57 %. Or `object-position: X %` place le début de la tranche à
                 `X % × (100 − 26) %` : il faut donc `X ≈ 57 / 74 ≈ 76 %` pour que la
                 personne tombe au milieu de l'écran au lieu d'être collée au bord droit.
                 C'est le seul réglage à toucher si le plan change : `object-[76%_center]`. */
              className="absolute inset-0 h-full w-full object-cover object-[76%_center] sm:object-center"
              src="/img/hero-deo.mp4"
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
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Voile blanc — ANGLES BAS-DROIT seulement, et LÉGER.

          L'ancien voile (`bg-gradient-to-t from-white`) courait sur toute la largeur : posé
          au bas d'un plan déjà clair, il blanchissait toute la moitié basse du hero. Celui-ci
          ne quitte pas le coin : un dégradé RADIAL centré sur le coin bas-droit, qui s'éteint
          bien avant le bord.

          Ce qui le garde léger, ce sont les rayons (110 % × 130 % de la boîte) : le long du
          bord gauche comme du bord haut, la lueur est déjà retombée à zéro. Elle ne touche
          donc jamais le texte — titre, sur-titre, paragraphe et boutons sont blancs eux
          aussi, et sur téléphone ils descendent bas et vont jusqu'au bord droit. Un seul
          réglage à toucher : la taille de la boîte (`h-*` / `w-[…]`). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-36 w-[50%] bg-[radial-gradient(110%_130%_at_100%_100%,#fff_0%,rgb(255_255_255_/_0.55)_42%,transparent_78%)] sm:h-64 sm:w-[64%]"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-5 md:px-8 xl:px-10">
        {/* Le bloc de texte est CENTRÉ, mais descendu d'un cran sur téléphone (`pt-40`) :
            à hauteur égale, le titre et les deux boutons tombaient trop haut, la moitié basse
            du hero restait vide, et le visage du plan — qui est en haut à droite — passait
            sous le texte. Sur grand écran, rien ne change. */}
        <div className="flex max-w-3xl flex-1 flex-col justify-center pt-40 sm:pt-0">
          <Reveal className="flex flex-col items-start gap-6">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)]">
              {ui.agency}
            </span>

            {/* Titre sur DEUX lignes, coupé au même endroit sur tous les écrans : le saut
                vient du `<br />` posé au début du contenu qui suit les mots, pas d'un
                `breakAfter` dépendant de la longueur — la phrase reste donc
                « Faites briller votre / marque. » en français, « Make your brand / shine. »
                en anglais.

                Le dernier mot est MOUVANT et en couleur de marque : il tourne sur plusieurs
                propositions (`RotatingWord`), ce qui donne au titre une seconde lecture à
                chaque passage. `label` sert la phrase entière aux lecteurs d'écran et à
                l'indexation, parce que le mot qui tourne est décoratif : c'est la première
                proposition du dictionnaire que voient les robots, et elle est complète. */}
            <SplitText
              as="h1"
              text={hero.leadStatic}
              label={hero.lead}
              trailing={
                <>
                  <br />
                  <RotatingWord words={hero.leadRotating} className="text-[#50B4D8]" />
                </>
              }
              delay={0.12}
              stagger={0.06}
              /* L'ombre portée du titre est héritée par le mot qui tourne : elle le tient
                 lisible sur n'importe quel plan de la vidéo, y compris en couleur de marque
                 (`text-brand`, posé sur `RotatingWord` juste au-dessus). */
              className="max-w-3xl font-light text-4xl leading-[1.06] text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.02]"
            />

            <p className="max-w-xl text-base leading-relaxed text-white [text-shadow:0_1px_2px_rgb(0_9_42_/_0.45),0_6px_24px_rgb(0_9_42_/_0.35)] sm:text-lg">
              {hero.body}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              {/* Pastille TRANSPARENTE sur le média : le variant `glass` n'a PAS de
                  `bg-gradient-*` (un `bg-*` posé sur `primary` serait masqué par
                  l'image de fond du dégradé) — le fond n'apparaît qu'au survol. */}
              <ButtonLink href={href("/devis")} variant="glass">
                {ui.freeQuote}
              </ButtonLink>
              <Link
                href={href("/realisations")}
                aria-label={ui.viewAllProjects}
                className="grid h-[3.35rem] w-[3.35rem] shrink-0 place-items-center rounded-full bg-brand text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
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
