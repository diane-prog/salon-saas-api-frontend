/** Courbes et durées partagées par les animations (framer-motion, GSAP, CSS). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN: [number, number, number, number] = [0.64, 0, 0.78, 0];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Mêmes courbes, prêtes à coller dans une déclaration CSS. */
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_IN_CSS = "cubic-bezier(0.64, 0, 0.78, 0)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Vrai si l'utilisateur demande moins d'animations (faux côté serveur). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
