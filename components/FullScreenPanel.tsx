"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { Close } from "@/components/Icons";
import { lockScroll } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Panneau plein écran, sur le noir neutre du site (`ink`), ouvert par l'icône du header ou
 * par un bouton de page. La recherche et le formulaire de contact partagent le même objet :
 * la mécanique vit ici une seule fois, les contenus arrivent en enfants.
 *
 * Ce que la mécanique garantit :
 * - la page est figée derrière (`lockScroll`, qui met aussi Lenis en pause) ;
 * - Échap ferme, Tab reste DANS le panneau, le focus part sur le premier champ à
 *   l'ouverture et revient au déclencheur à la fermeture ;
 * - ce retour de focus se fait à la frame SUIVANTE, jamais dans la foulée de la fermeture :
 *   traité tout de suite, la fin de la séquence de la touche qui a fermé (Entrée) activait
 *   le déclencheur redevenu focalisé, et le panneau se rouvrait aussitôt ;
 * - l'entrée est en GSAP — fondu du panneau, puis cascade des `[data-panel-in]` — et
 *   s'efface entièrement sous `prefers-reduced-motion`.
 *
 * Le panneau n'existe dans le document que lorsqu'il est ouvert : il est monté par
 * l'appelant, qui garde l'état et le déclencheur.
 *
 * Il est rendu dans un PORTAIL, à la fin de `<body>` — et non à l'endroit du bouton qui
 * l'ouvre. Raison mesurée : le contenu des pages vit dans `.page-enter`, dont l'animation
 * d'opacité en `both` fait un contexte d'empilement ; un panneau monté là-dedans reste
 * peint SOUS les blocs qui le suivent, même `fixed` et même avec un `z-index` de 9999
 * (vérifié au navigateur : le footer de la page recouvrait le bouton « Envoyer » du
 * formulaire, un clic souris ne partait jamais). En portail, le panneau est un frère de
 * la page : il se pose au-dessus, où qu'il soit ouvert.
 */
export default function FullScreenPanel({
  label,
  closeLabel,
  onClose,
  returnFocusTo,
  footer,
  children,
}: {
  /** Nom du dialogue (le titre que lira un lecteur d'écran). */
  label: string;
  /** Nom du bouton de fermeture. */
  closeLabel: string;
  onClose: () => void;
  /** Élément qui reprend le focus à la fermeture (le déclencheur). */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
  /** Ligne de pied du panneau (rappel clavier, coordonnées…). */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  /* L'hôte du portail est lu au rendu : `<body>` n'existe pas au rendu serveur, et le
     panneau n'est de toute façon monté qu'à l'ouverture, donc jamais dans le HTML servi.
     Pas d'état ni d'effet ici, donc pas de re-rendu en cascade à l'ouverture. */
  const host = typeof document === "undefined" ? null : document.body;

  /* Entrée : fondu du panneau puis cascade des contenus marqués. La dépendance `host`
     fait repartir l'effet quand le portail rend enfin le panneau : au premier passage,
     `panelRef.current` est encore vide. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) return;

    const timeline = gsap.timeline();
    timeline
      .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      .fromTo(
        panel.querySelectorAll("[data-panel-in]"),
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.055 },
        0.05,
      );

    return () => {
      timeline.kill();
    };
  }, [host]);

  /* Page figée, Échap, Tab contenu dans le panneau, et focus posé sur le premier champ. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    /* Le déclencheur est lu MAINTENANT (il est monté avant le panneau) : dans le nettoyage,
       `ref.current` pourrait déjà pointer ailleurs. */
    const returnTo = returnFocusTo?.current ?? null;
    lockScroll(true);

    /* Le focus part sur un CHAMP, pas sur la croix de fermeture : un panneau s'ouvre pour
       qu'on écrive (une recherche, un formulaire). `[data-panel-autofocus]` permet de
       désigner lequel quand le premier du document n'est pas le bon. */
    const first =
      panel.querySelector<HTMLElement>("[data-panel-autofocus]") ??
      panel.querySelector<HTMLElement>("input, textarea, select") ??
      panel.querySelector<HTMLElement>("button, a[href]");
    /* Un champ reçoit le focus dès qu'il est dans le document, donc dès la première frappe. */
    const focusTimer = window.setTimeout(() => first?.focus(), 0);

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panel.querySelectorAll<HTMLElement>("a[href], button, input, textarea, select");
      if (focusables.length === 0) return;
      const start = focusables[0];
      const end = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && current === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && current === end) {
        event.preventDefault();
        start.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      lockScroll(false);
      requestAnimationFrame(() => returnTo?.focus());
    };
  }, [host, onClose, returnFocusTo]);

  if (!host) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="grain fixed inset-0 z-70 flex flex-col bg-ink text-paper"
    >
      {/* Barre haute : le logo clair, comme le menu mobile, et la fermeture cerclée. */}
      <div data-panel-in className="container-x flex items-center justify-between py-5">
        <Image
          src="/img/logo.png"
          alt="LEEGI Group"
          width={150}
          height={60}
          priority
          className="h-9 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="grid h-11 w-11 place-items-center rounded-full text-paper/70 ring-1 ring-paper/20 transition-colors hover:text-paper hover:ring-paper/50"
        >
          <Close />
        </button>
      </div>

      {children}

      {footer && (
        <div
          data-panel-in
          className="container-x flex items-center justify-between gap-6 border-t border-paper/10 py-6 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-paper/35"
        >
          {footer}
        </div>
      )}
    </div>,
    host,
  );
}
