"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Amplitude du mouvement, en pourcentage de la hauteur de l'élément. */
  amount?: number;
  /** Agrandissement évitant de découvrir les bords pendant le mouvement. */
  scale?: number;
};

/**
 * Parallaxe GSAP/ScrollTrigger : le contenu glisse dans son cadre au fil du scroll.
 * Désactivé si l'utilisateur demande moins d'animations.
 *
 * Le cadre doit pouvoir ENCAISSER le mouvement, sinon les bords se découvrent :
 *
 * - soit la boîte est plus grande que la découpe (`-inset-y-[8%]` dans un parent en
 *   `overflow-hidden`) — c'est le cas des photos pleine largeur ;
 * - soit l'image est agrandie pour couvrir le débattement : il faut alors
 *   `scale ≥ 1 + 2 × amount / 100` (amount = 4 → scale 1,09) — c'est le cas des photos
 *   dans un cadre fermé (carte, portrait), dont on ne peut pas déborder la boîte.
 *
 * À éviter sur un média déjà flouté ou étiré par un `transform` : la parallaxe y coûte
 * cher au scroll pour un effet que le flou rend invisible.
 */
export default function Parallax({ children, className = "", amount = 5, scale = 1 }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    if (!el || !inner) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.fromTo(
      inner,
      { yPercent: -amount, scale },
      {
        yPercent: amount,
        scale,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(inner, { clearProps: "transform" });
    };
  }, [amount, scale]);

  return (
    <div ref={frame} className={className}>
      <div className="relative h-full w-full will-change-transform">{children}</div>
    </div>
  );
}
