"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Section « pourquoi nous » de la page À propos, copie du design Careers de la
 * référence :
 *
 * - colonne de gauche : TW occupée par le titre de la page (rendu par la page hôte,
 *   ce composant ne dessine que la grille dessous) ;
 * - colonne du centre : une même phrase répétée en pile — chaque ligne est grise
 *   (text-navy/12), la ligne ACTIVE est navy plein. La ligne active suit le scroll :
 *   c'est celle dont le centre est le plus proche du centre du viewport (aucun timer,
 *   l'état dérive du défilement, comme dans la référence) ;
 * - colonne de droite : la photo, avec une carte de verre par-dessus (badge + œil du
 *   logo + « OPENINGS » + libellés d'offres).
 *
 * Accessibilité : les lignes sont lisibles à pleine opacité en mouvement réduit et
 * sans JS (les classes d'assombrissement ne s'appliquent que sous `html[data-js]`,
 * règle CSS globale déjà en place : sans data-js rien n'est atténué).
 */

/**
 * Animation AUTOMATIQUE de la pile : un minuteur fait avancer la ligne active toutes
 * les 2,4 s ; elle passe à pleine teinte (navy), les autres restent gris pâle. La pile
 * tourne en permanence (boucle), l'utilisateur n'a rien à faire — et en mouvement
 * réduit, rien n'est animé : tout reste lisible.
 *
 * Pause au survol et au focus clavier (comme le carrousel réalisations) ; survol ou
 * clic d'une ligne = elle devient active et le cycle reprend d'elle. Le hook remonte
 * l'index actif pour le sync de la carte de verre (contenu qui change avec la pile).
 */
function useAutoHighlight(
  onIndexChange?: (index: number) => void,
): { ref: React.RefObject<HTMLUListElement | null>; pause: (p: boolean) => void } {
  const ref = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const pile = ref.current;
    if (!pile) return;
    const lines = [...pile.querySelectorAll<HTMLElement>("[data-statement]")];
    if (lines.length === 0) return;

    let index = 0;
    const paint = () => {
      lines.forEach((line, i) => {
        line.style.color = i === index ? "var(--color-navy)" : "";
        line.style.cursor = "pointer";
      });
      onIndexChange?.(index);
    };

    let interval: number | undefined;
    const start = () => {
      if (interval || pausedRef.current) return;
      interval = window.setInterval(() => {
        index = (index + 1) % lines.length;
        paint();
      }, 2400);
    };
    const stop = () => {
      if (interval) {
        window.clearInterval(interval);
        interval = undefined;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { threshold: 0.25 });

    lines.forEach((line, i) => {
      // Survol d'une ligne : elle devient active, le cycle s'arrête jusqu'à sortie.
      line.addEventListener("mouseenter", () => {
        index = i;
        paint();
        stop();
      });
      // Clic : même effet, et maintient la pause après le clic.
      line.addEventListener("click", () => {
        index = i;
        paint();
      });
    });

    observer.observe(pile);
    paint();

    return () => {
      observer.disconnect();
      stop();
    };
  }, [onIndexChange]);

  return { ref, pause: (p: boolean) => { pausedRef.current = p; } };
}

export default function WhyStatements() {
  const { dict } = useDictionary();
  const why = dict.aboutPage;
  const statements = why.whyStatements;
  /* L'index actif de la pile pilote le contenu de la carte sur l'image. */
  const [activeIndex, setActiveIndex] = useState(0);
  const setActive = useCallback((index: number) => setActiveIndex(index), []);
  const { ref: pileRef, pause } = useAutoHighlight(setActive);

  return (
    <section className="border-y border-navy/8 bg-white">
      <div className="mx-auto grid w-full max-w-[95rem] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.55fr_1.5fr_1.25fr] lg:gap-16">
        {/* Colonne 1 : sur-titre discret, comme « WHY WORK WITH US ». */}
        <Reveal>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-navy/70">
            {why.whyEyebrow}
          </p>
        </Reveal>

        {/* Colonne 2 : la pile de phrases, animée automatiquement (boucle). Pause
            au survol de la zone — pour lire tranquillement ou cliquer une ligne. */}
        <Reveal delay={80}>
          <ul
            ref={pileRef}
            onMouseEnter={() => pause(true)}
            onMouseLeave={() => pause(false)}
            className="why-pile flex flex-col gap-7 lg:gap-8"
            aria-label={why.whyEyebrow}
          >
            {statements.map((statement) => (
              <li
                key={statement}
                data-statement
                className="text-3xl leading-[1.18] tracking-tight text-navy/15 transition-colors duration-300 sm:text-4xl"
              >
                {statement}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Colonne 3 : photo + carte de verre superposée, agrandie (hauteur pleine
            de la pile, comme la référence où l'image occupe tout le bord droit). */}
        <Reveal delay={160}>
          <div className="relative h-full min-h-[30rem] overflow-hidden rounded-[1.1rem] lg:min-h-[34rem]">
            <Image
              src={why.whyImage}
              alt={aboutImageAlt(dict)}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />

            {/* Carte simple posée sur l'image : blur LÉGER (sm, pas xl), une seule
                ligne de texte — celle ACTIVE dans la pile. Elle change quand la pile
                avance, hover ou clic : c'est l'écho visuel du carrousel. */}
            <div className="absolute inset-x-4 bottom-4 rounded-[0.9rem] border border-white/20 bg-navy/20 px-5 py-4 backdrop-blur-sm sm:inset-x-5 sm:bottom-5">
              <p
                key={statements[activeIndex]}
                className="text-[0.95rem] leading-snug text-white transition-opacity duration-300"
              >
                {statements[activeIndex]}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Texte alternatif de l'image, localisé (le hook n'existe qu'ici). */
function aboutImageAlt(dict: { site: { name: string } }): string {
  return `L'équipe ${dict.site.name}`;
}
