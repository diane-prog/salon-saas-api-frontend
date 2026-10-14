"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type RotatingWordProps = {
  /** Mots à faire défiler, dans l'ordre. Le premier est celui affiché au chargement. */
  words: string[];
  /** Délai entre deux relèves (ms). */
  interval?: number;
  className?: string;
};

/**
 * Un mot qui TOURNE : les mots sont tous dans la même cellule de grille, seul l'actif est
 * visible — le changement est donc une transition CSS, sans hauteur qui bouge ni minuterie
 * dans le rendu.
 *
 * Pourquoi une GRILLE et pas une largeur mesurée : la cellule prend la largeur du plus long
 * des mots, donc la place réservée ne change jamais. Le titre ne se recale pas à chaque
 * relève, et la ligne suivante ne se décale pas non plus. Ce qui bouge : opacité, montée de
 * 0,28 em et un flou de 3 px — l'ancien mot s'efface en montant, le nouveau monte d'en dessous,
 * ce qui se lit comme un mot poussé par le suivant.
 *
 * Aucun masque (`overflow: hidden`) : la hauteur d'une ligne est celle du texte, et un masque
 * rognerait les jambages (le « g » de « glow. ») tout en laissant voir un morceau du mot qui
 * s'en va. Le flou et l'opacité suffisent à cacher la relève.
 *
 * Le composant est appelé à l'intérieur de la partie `aria-hidden` d'un titre : les mots ne
 * sont donc pas annoncés un par un par les technologies d'assistance, qui lisent la phrase
 * entière fournie par le titre (`SplitText`, prop `label`).
 *
 * Mouvement réduit : le premier mot reste affiché, sans relève — un texte qui change tout seul
 * est exactement ce que `prefers-reduced-motion` demande d'éviter.
 */
export default function RotatingWord({
  words,
  interval = 2600,
  className = "",
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`inline-grid ${className}`}>
      {words.map((word, i) => (
        <span
          key={word}
          className={`col-start-1 row-start-1 transition-[opacity,translate,filter] duration-700 ease-out motion-reduce:transition-none ${
            i === index
              ? "translate-y-0 opacity-100 blur-[0px]"
              : "translate-y-[0.28em] opacity-0 blur-[3px]"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
