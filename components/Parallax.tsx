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
