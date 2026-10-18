"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import Reveal from "@/components/Reveal";
import ScrollStack from "@/components/ScrollStack";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Section « Pourquoi Belora » — la composition de la référence, à la lettre.
 *
 * Quatre choses seulement, et rien d'autre :
 *
 *   1. le TITRE, seul, en haut à gauche, sur deux lignes, sans sur-titre ni filet ;
 *   2. la SORTIE entre crochets, en petites capitales, en haut à droite — `[ MÉTHODE ]` ;
 *   3. une GRILLE de TROIS cases réparties en L inversé : `01` en haut à gauche,
 *      `02` à sa droite, `03` DIRECTEMENT SOUS `02`. La case sous `01`
 *      reste volontairement vide ;
 *   4. l'ILLUSTRATION en bas à droite, à la hauteur de `03`, avec la pastille posée
 *      dessus.
 *
 * La trame est une grille de TROIS colonnes et DEUX lignes, pas deux colonnes : sans la
 * troisième colonne, l'image retomberait sous `03` et la composition en L serait
 * perdue. Les emplacements sont donc posés explicitement (`col-start` / `row-start`), et
 * les deux cases vides (dessous `01`, au-dessus de l'image) ne sont pas rendues du
 * tout : c'est le blanc qui les tient.
 *
 * Les cases sont SÉPARÉES par un blanc, pas collées : chacune porte son propre filet
 * d'un pixel (référence), et le blanc du fond fait la respiration entre elles.
 *
 * Pas d'ombre, pas d'arrondi, pas de carte flottante, pas de grande case d'en-tête dans la
 * grille : l'en-tête est HORS grille, comme sur la référence.
 *
 * L'OUVERTURE EST PILOTÉE PAR LE DÉFILEMENT (`ScrollStack`) : à l'approche de la section,
 * les quatre cases sont empilées au centre de la trame — on ne voit qu'une fiche, les
 * autres dépassant de quelques pixels — puis elles rejoignent leur place à mesure qu'on
 * descend. La trame définitive est celle décrite ci-dessus : elle ne dépend pas de
 * l'animation, qui n'est qu'un habillage (et qui s'éteint sur mobile comme sous
 * `prefers-reduced-motion`).
 *
 * L'illustration est livrée avec le dépôt (`public/media/why.jpg`) ; `NEXT_PUBLIC_WHY_IMAGE`
 * la REMPLACE quand elle est posée (chemin local ou URL absolue), sans toucher au reste.
 * Sans image du tout, le champ est dessiné (soleil + grain). La pastille reste au-dessus dans
 * tous les cas.
 */
const IMAGE = process.env.NEXT_PUBLIC_WHY_IMAGE ?? "/media/why.jpg";

export default function WhyStatements() {
  const { dict, locale } = useDictionary();
  const why = dict.aboutPage;
  const { ui } = dict;

  return (
    <section className="bg-white text-ink">
      <div className="mx-auto w-full max-w-[95rem] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        {/* ——— En-tête : le titre à gauche, la sortie à droite, sur la même ligne haute. */}
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-4">
          <h2 className="max-w-[16ch] text-[clamp(1.9rem,3.9vw,3.2rem)] font-light leading-[1.06] tracking-[-0.03em]">
            {why.whyHeadline}
          </h2>

          <Link
            href={`/${locale}/services`}
            className="mt-1 shrink-0 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-ink"
          >
            {ui.methodology}
          </Link>
        </div>

        {/* ——— La trame : trois colonnes, deux lignes, un blanc entre les cases.
                Positions posées à la main — `01` (1,1), `02` (1,2), `03` (2,2),
                image (2,3). Les cases vides ne sont pas rendues : le blanc les tient.
                Sur téléphone, tout s'empile dans l'ordre de lecture 01 → 02 → 03 → image. */}
        <ScrollStack className="mt-8 grid grid-cols-1 gap-2.5 sm:mt-10 sm:grid-cols-[1fr_1fr_1.15fr] sm:gap-3">
          {why.whyCards.map((card, index) => {
            /* L'escalier : la première au coin haut gauche, les suivantes une colonne plus
               loin, en descendant d'une ligne à chaque fois. */
            const placement = [
              "sm:col-start-1 sm:row-start-1",
              "sm:col-start-2 sm:row-start-1",
              "sm:col-start-2 sm:row-start-2",
            ][index];

            /* Profondeur de la pile : chaque fiche recule de 2 % par rapport à la suivante,
               si bien que leurs bords dépassent en escalier au repos. L'ordre d'empilement
               est inverse (`zIndex`) : la fiche du dessus est « 01 », la première de la
               lecture — c'est elle qu'on voit quand tout est regroupé. */
            const depth = 0.94 + index * 0.02;

            return (
              <li
                key={card.title}
                className={placement}
                style={{ "--stack-s": depth, zIndex: why.whyCards.length + 1 - index } as CSSProperties}
              >
                <Reveal as="div" delay={index * 60} className="h-full">
                  <article className="flex h-full min-h-[12.5rem] flex-col border border-ink/12 p-5 sm:min-h-[16rem] sm:p-6 lg:min-h-[18rem] lg:p-7">
                    <span className="text-[0.62rem] font-medium tabular-nums tracking-[0.14em] text-ink/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="mt-3 max-w-[24ch] text-[1.05rem] font-light leading-[1.25] text-ink lg:text-[1.15rem]">
                      {card.title}
                    </h3>

                    <p className="mt-auto max-w-[34ch] pt-8 text-[0.8rem] leading-[1.6] text-ink/55">
                      {card.body}
                    </p>
                  </article>
                </Reveal>
              </li>
            );
          })}

          {/* ——— L'illustration : elle ferme la grille en bas à droite, à la hauteur de
                  `03`, laissant le coin bas gauche vide. La pastille est posée dessus. */}
          <li
            className="min-h-[12.5rem] sm:col-start-3 sm:row-start-2 sm:min-h-[16rem] lg:min-h-[18rem]"
            style={{ "--stack-s": 1, zIndex: 1 } as CSSProperties}
          >
            <Reveal as="div" delay={why.whyCards.length * 60} className="h-full">
              <div className="relative h-full min-h-[12.5rem] overflow-hidden bg-ink sm:min-h-[16rem] lg:min-h-[18rem]">
                {IMAGE ? (
                  // eslint-disable-next-line @next/next/no-img-element -- image fournie par l'exploitant (chemin local ou URL), hors liste blanche de `next/image`
                  <img
                    src={IMAGE}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(150deg,#e8cda4_0%,#cfa271_42%,#96693e_78%,#5d422b_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(58%_58%_at_68%_18%,rgba(255,242,216,0.8),transparent_72%)]" />
                  </>
                )}

                {/* Le grain dans son propre cadre : `grain` pose `position: relative`. */}
                <div className="absolute inset-0">
                  <div className="grain h-full w-full" />
                </div>

                <Link
                  href={`/${locale}/register`}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-turquoise px-4 py-2.5 text-[0.56rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-paper"
                >
                  {ui.freeQuote}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </li>
        </ScrollStack>
      </div>
    </section>
  );
}
