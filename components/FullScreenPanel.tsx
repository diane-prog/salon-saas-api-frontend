"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { Close } from "@/components/Icons";
import { lockScroll } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Panneau plein écran ouvert par l'icône du header ou par un bouton de page. La recherche et
 * le formulaire de contact partagent le même objet : la mécanique vit ici une seule fois, les
 * contenus arrivent en enfants. La surface se choisit par `tone` : l'encre pleine du site
 * (`ink`, le défaut) ou le verre (`glass` — encre translucide + flou d'arrière-plan, pour le
 * méga menu Services, qui laisse deviner la page derrière lui).
 *
 * Ce que la mécanique garantit :
 * - la page est figée derrière (`lockScroll`, qui met aussi Lenis en pause) ;
 * - Échap ferme, Tab reste DANS le panneau, le focus part sur le premier champ à
 *   l'ouverture et revient au déclencheur à la fermeture ;
 * - ce retour de focus se fait à la frame SUIVANTE, jamais dans la foulée de la fermeture :
 *   traité tout de suite, la fin de la séquence de la touche qui a fermé (Entrée) activait
 *   le déclencheur redevenu focalisé, et le panneau se rouvrait aussitôt ;
 * - l'entrée est en deux temps : le PANNEAU lui-même glisse du haut vers le bas, du même
 *   geste que le rideau de transition (animation CSS `panel-cover`, cf. globals.css), puis
 *   les `[data-panel-in]` montent en cascade ; le tout s'efface sous
 *   `prefers-reduced-motion` ; son état de départ est posé
 *   AVANT la première peinture (voir l'effet d'entrée), pour que le panneau ne clignote
 *   jamais une frame à pleine opacité avant de repartir de zéro.
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
  tone = "glass",
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
  /**
   * Surface du panneau. `glass` (DÉFAUT) : encre translucide + flou d'arrière-plan — la page
   * reste devinée derrière le panneau, tous les méga menus du site se ressemblent. On y garde
   * une base encre assez dense pour que le texte clair tienne son contraste même si le
   * navigateur ignore `backdrop-filter`. `ink` : l'encre pleine, pour un panneau qui doit
   * vraiment fermer la vue (le rideau de transition s'en sert).
   */
  tone?: "ink" | "glass";
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  /* L'hôte du portail est lu au rendu : `<body>` n'existe pas au rendu serveur, et le
     panneau n'est de toute façon monté qu'à l'ouverture, donc jamais dans le HTML servi.
     Pas d'état ni d'effet ici, donc pas de re-rendu en cascade à l'ouverture. */
  const host = typeof document === "undefined" ? null : document.body;

  /* Entrée : le panneau glisse depuis le haut (CSS, `panel-cover` — le geste du rideau de
     transition), puis les contenus montent en cascade. La dépendance `host` fait repartir
     l'effet quand le portail rend enfin le panneau : au premier passage, `panelRef.current`
     est encore vide.

     Ici, seulement la CASCADE. Le glissement du panneau est en CSS : une translation
     verticale jouée par le compositeur, sans JS par frame, et sans démarcation du viewport.

     L'état de départ de la cascade est posé en LAYOUT (avant peinture) et non après : le
     panneau descend avec sa surface SEULE, puis son contenu apparaît — jamais l'inverse.

     Le départ de la cascade (0,28 s) tombe pendant la descente du panneau (0,52 s) : le
     contenu arrive quand la surface se pose, comme le libellé du rideau. */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) return;

    const items = panel.querySelectorAll("[data-panel-in]");
    gsap.set(items, { y: 30, opacity: 0 });

    const timeline = gsap.timeline();
    timeline.to(items, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.055,
      delay: 0.28,
    });

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
      className={`panel-cover grain fixed inset-0 z-70 flex flex-col text-paper ${
        tone === "glass" ? "bg-ink/70 backdrop-blur-md" : "bg-ink"
      }`}
    >
      {/* Barre haute : le logo clair, comme le menu mobile, et la fermeture cerclée. */}
      <div data-panel-in className="container-x flex items-center justify-between py-5">
        <Image
          src="/img/logo.png"
          alt="LEEGI Group"
          width={150}
          height={60}
          priority
          className="h-16 -ml-9 w-auto"
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
