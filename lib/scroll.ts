import type Lenis from "lenis";

/**
 * Instance Lenis partagée (un seul scroller par document).
 * Module non-"use client" : il ne fait qu'exposer une référence mutable.
 */
export const lenisStore: { current: Lenis | null } = { current: null };

export function hasLenis(): boolean {
  return lenisStore.current !== null;
}

/** Remonte en haut de page : instantané pendant une transition, animé en usage normal. */
export function scrollToTop(immediate = true): void {
  if (typeof window === "undefined") return;
  const lenis = lenisStore.current;
  if (lenis) {
    lenis.scrollTo(0, { immediate, force: true });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: immediate ? "auto" : "smooth" });
}

/**
 * Bloque/débloque le défilement (menu mobile plein écran, rideau de transition).
 * Lenis est mis en pause pour que la molette ne fasse pas défiler la page derrière.
 */
export function lockScroll(locked: boolean): void {
  if (typeof window === "undefined") return;
  const lenis = lenisStore.current;
  if (locked) {
    lenis?.stop();
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";
  } else {
    lenis?.start();
    document.documentElement.classList.remove("lenis-stopped");
    document.body.style.overflow = "";
  }
}
