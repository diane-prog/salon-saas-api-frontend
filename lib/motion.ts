/** Courbes et durées partagées par les animations (framer-motion, GSAP, CSS). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN: [number, number, number, number] = [0.64, 0, 0.78, 0];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Mêmes courbes, prêtes à coller dans une déclaration CSS. */
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_IN_CSS = "cubic-bezier(0.64, 0, 0.78, 0)";

/** Timeline du rideau de transition (secondes pour framer-motion, ms pour les timeouts). */
export const CURTAIN = {
  cover: 0.52,
  hold: 0.34,
  reveal: 0.62,
  /** Début de l'apparition du libellé : panneau à plat. */
  label: 0.34,
  coverMs: 520,
  holdMs: 340,
  revealMs: 620,
  /**
   * Délai MAXIMAL accordé à la navigation avant de retirer le rideau quoi qu'il arrive.
   *
   * Ce n'est PAS la sortie normale : le rideau se lève quand la page d'arrivée est réellement
   * peinte (voir PageTransition). Ce minuteur n'existe que pour ne jamais laisser l'écran
   * couvert — il doit donc couvrir le pire des cas RÉEL : une route non préchargée, compilée
   * à la volée en développement ou servie lentement. Les 2,2 s d'origine suffisaient à un
   * changement de page à chaud ; sur une page non préchargée, le rideau se levait avant que
   * la nouvelle page n'existe et découvrait l'ANCIENNE (le glitch « le rideau affiche la page
   * en anglais avant de disparaître »). 8 s est le plafond qu'on s'autorise, pas une durée
   * d'attente.
   */
  stopLossMs: 8000,
} as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Vrai si l'utilisateur demande moins d'animations (faux côté serveur). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
