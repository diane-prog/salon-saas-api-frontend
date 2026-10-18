/**
 * Déclencheur de révélation partagé (texte et cartes).
 *
 * Un seul écouteur `scroll` paresseux, échantillonné une fois par frame, sert tous les
 * éléments en attente d'animation. Contrairement à un IntersectionObserver, il révèle
 * aussi les éléments *sautés* (arrivée directe en bas de page, ancre, restauration de
 * position) : leur état d'intersection n'a jamais changé, donc l'observer n'aurait
 * jamais émis d'évènement et le contenu serait resté invisible.
 *
 * La frame planifiée est partagée : elle n'est annulée que lorsqu'il ne reste plus
 * aucun élément en attente (l'annuler depuis un composant qui se démonte laisserait
 * les autres sans animation).
 *
 * LECTURES PUIS ÉCRITURES. `getBoundingClientRect()` oblige le navigateur à recalculer
 * la mise en page ; `show()` démarre une animation, donc écrit des styles. Appeler les
 * deux dans la même boucle faisait payer un recalcul PAR ÉLÉMENT révélé — au moment
 * précis où la page défile, c'est-à-dire le pire moment. On mesure donc tout d'abord, puis
 * on révèle : un seul recalcul pour toute la fournée.
 */

type Pending = { el: Element; show: () => void };

const pending = new Set<Pending>();
let frame = 0;
let listening = false;

function tick() {
  frame = 0;
  const limit = window.innerHeight * 0.9;
  const ready: Pending[] = [];

  for (const entry of pending) {
    const rect = entry.el.getBoundingClientRect();
    const visible = rect.top < limit && rect.bottom > 0;
    const passed = rect.bottom <= 0;
    if (visible || passed) ready.push(entry);
  }

  for (const entry of ready) {
    entry.show();
    pending.delete(entry);
  }

  if (pending.size === 0) stop();
}

function schedule() {
  if (frame || pending.size === 0) return;
  frame = window.requestAnimationFrame(tick);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

function stop() {
  if (listening) {
    listening = false;
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  }
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
}

/** Révèle `show()` dès que l'élément approche du viewport (ou l'a déjà dépassé). */
export function observeReveal(el: Element, show: () => void): () => void {
  const entry: Pending = { el, show };
  pending.add(entry);
  start();
  schedule();
  return () => {
    pending.delete(entry);
    if (pending.size === 0) stop();
  };
}
