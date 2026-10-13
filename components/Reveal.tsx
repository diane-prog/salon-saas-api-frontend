"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { observeReveal } from "@/lib/reveal";
import { prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Styles de mise en place de l'élément (position, inclinaison…). */
  style?: CSSProperties;
};

/**
 * Réglages de l'entrée. L'ancien fondu CSS montait de 28 px en 0,75 s : on garde la même
 * famille de courbe, mais plus franche — l'entrée d'une section se voit. `LIFT` est aussi
 * la valeur du masque CSS (globals.css), les deux doivent rester d'accord pour que le
 * mouvement parte de l'état déjà peint, sans saut à la première frame.
 */
const LIFT = 48;
const DURATION = 1.05;
const EASE = "power3.out";

/** Marqueur d'entrée jouée : il retire le masque CSS. */
const PLAYED = "data-reveal";

/**
 * Entrée de section : l'élément monte et apparaît quand il approche du viewport.
 *
 * Le MOUVEMENT est en GSAP ; le DÉCLENCHEUR reste celui du projet (`lib/reveal`) : un seul
 * écouteur de scroll paresseux pour tous les éléments, et surtout les éléments déjà
 * *dépassés* sont révélés — leur intersection ne changeant jamais, un IntersectionObserver
 * (et une ScrollTrigger `start` seule, dans le même cas) les aurait laissés invisibles.
 *
 * Le MASQUE de départ est en CSS (voir globals.css) : il couvre la frame qui précède
 * l'hydratation, que du JavaScript ne peut pas couvrir. GSAP l'écrase pendant le mouvement,
 * puis le retire en rendant la main au CSS (`clearProps`) dans le même souffle que le
 * marqueur `data-reveal="played"`.
 *
 * Mouvement réduit : rien n'est masqué en CSS et l'effet ne fait rien — le contenu est là
 * d'emblée, sans mouvement.
 *
 * Les propriétés sont rendues à la fin : la mise en place finale est celle du CSS, donc un
 * `transform` de survol posé par un enfant ou un `sticky` plus bas dans l'arbre retrouvent
 * leur fonctionnement normal une fois l'entrée jouée.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    /* Fin d'entrée : le marqueur et le nettoyage des styles en ligne sont posés dans le
       même bloc — sans quoi l'élément repasserait une frame sous le masque CSS. */
    const settle = () => {
      el.setAttribute(PLAYED, "played");
      gsap.set(el, { clearProps: "transform,opacity" });
    };

    const stop = observeReveal(el, () => {
      gsap.fromTo(
        el,
        { y: LIFT, opacity: 0 },
        { y: 0, opacity: 1, duration: DURATION, ease: EASE, delay: delay / 1000, onComplete: settle },
      );
    });

    return () => {
      stop();
      gsap.killTweensOf(el);
      settle();
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}
