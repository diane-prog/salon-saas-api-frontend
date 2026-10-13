"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";
import { observeReveal } from "@/lib/reveal";

type SplitTextProps = {
  text: string;
  /** Second fragment mis en avant (dégradé de marque) dans la même ligne. */
  accent?: string;
  accentClassName?: string;
  as?: ElementType;
  className?: string;
  /** Délai avant le premier mot (secondes, comme framer-motion). */
  delay?: number;
  stagger?: number;
  duration?: number;
  /**
   * `in-view` (défaut) : révèle à l'entrée dans le viewport.
   * `on-mount` : révèle dès le montage (panneau de transition, toujours visible).
   */
  mode?: "in-view" | "on-mount";
  /**
   * `mask` (défaut) : chaque mot est masqué puis remonte dans son cadre.
   * `color` : pas de masque — le mot passe du gris au navy, mot après mot
   * (paragraphe des hero clairs : la queue grise est le texte pas encore révélé).
   */
  reveal?: "mask" | "color";
  /**
   * Saut de ligne forcé après ce nombre de mots : `2` met les deux premiers mots sur
   * la première ligne. Indépendant de la largeur du conteneur, donc le titre se coupe
   * au même endroit sur tous les écrans (et dans les deux langues, un `<br>` par ligne).
   */
  breakAfter?: number;
};

/**
 * Révélation de texte « awwwards » : chaque mot est masqué puis remonte dans son cadre.
 * Le mouvement est du CSS transform (fluide, GPU) gardé par `html[data-js]` : sans
 * JavaScript, le texte reste lisible.
 *
 * Le déclencheur (`lib/reveal`) couvre aussi les sauts de scroll : un élément déjà
 * *dépassé* est révélé, sans attendre une intersection qui n'arrivera jamais.
 */
export default function SplitText({
  text,
  accent,
  accentClassName = "",
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.05,
  duration = 0.9,
  mode = "in-view",
  reveal = "mask",
  breakAfter,
}: SplitTextProps) {
  const fade = reveal === "color";
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const onMount = mode === "on-mount";

  useEffect(() => {
    if (onMount) return;
    const el = ref.current;
    if (!el) return;
    // Le premier contrôle a lieu une frame après le montage : la position masquée est
    // déjà peinte, la transition CSS peut donc jouer.
    return observeReveal(el, () => setShown(true));
  }, [onMount]);

  const words: { value: string; accent: boolean }[] = [
    ...text.split(/\s+/).filter(Boolean).map((value) => ({ value, accent: false })),
    ...(accent ?? "").split(/\s+/).filter(Boolean).map((value) => ({ value, accent: true })),
  ];
  const full = accent ? `${text} ${accent}` : text;

  return (
    <Tag
      ref={ref as never}
      className={`split ${fade ? "split-fade" : ""} ${onMount ? "split-anim" : shown ? "split-in" : ""} ${className}`}
    >
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {/* L'espace va ENTRE les masques, jamais dedans : un `inline-block` en
            `overflow: hidden` rogne l'espace en fin de ligne, ce qui collait les mots
            (« Faitesbriller… »). En dehors, c'est le parent qui le rend, et la coupure
            de ligne reste possible entre deux mots. */}
        {words.map((word, index) => {
          const style = {
            "--w-delay": `${Math.round((delay + index * stagger) * 1000)}ms`,
            "--w-duration": `${duration}s`,
          } as CSSProperties;
          const node = (
            <span className={`split-word ${word.accent ? accentClassName : ""}`} style={style}>
              {word.value}
            </span>
          );
          return (
            <Fragment key={`${word.value}-${index}`}>
              {/* L'espace va ENTRE les masques, jamais dedans : un `inline-block` en
                  `overflow: hidden` rogne l'espace en fin de ligne, ce qui collait les
                  mots (« Faitesbriller… »). En dehors, c'est le parent qui le rend, et la
                  coupure de ligne reste possible entre deux mots. */}
              {fade ? node : <span className="split-mask">{node}</span>}
              {index < words.length - 1 ? (breakAfter === index + 1 ? <br /> : " ") : null}
            </Fragment>
          );
        })}
      </span>
    </Tag>
  );
}
