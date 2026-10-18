"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Grille qui se déplie au défilement : les cases partent EMPILÉES AU CENTRE — une seule
 * fiche visible, les autres derrière — puis rejoignent leur place dans la trame.
 *
 * TROIS CHOSES ONT ÉTÉ CORRIGÉES LE 2026-10-18, parce que l'effet ne se voyait pas :
 *
 *   1. LA SCÈNE EST ÉPINGLÉE. La grille reste collée à 12 vh du haut pendant qu'on descend
 *      (`position: sticky` dans `globals.css`) : les fiches s'ouvrent sous les yeux, sur
 *      ~100 vh de défilement. Avant, l'ouverture se jouait pendant la simple entrée de la
 *      section dans l'écran — terminée avant qu'on ait pu la regarder.
 *   2. ELLE S'APPLIQUE À TOUTES LES LARGEURS. Le premier jet la réservait au desktop
 *      (`min-width: 640px`) : sur une fenêtre étroite, il n'y avait rien du tout.
 *   3. LA PILE EST EXACTE ET DÉCALÉE DANS LE TEMPS. Les fiches convergent vers le MÊME
 *      point (plus de décalage latéral ni d'inclinaison : ça ressemblait à une grille
 *      cassée), et chacune part avec un temps de retard sur la précédente — c'est ce
 *      décalage qui rend l'éclatement lisible plutôt que simultané.
 *
 * UNE SEULE VARIABLE, `--stack` (0 → 1), par case. Chaque case connaît son décalage de
 * repos (`--stack-x` / `--stack-y`, mesuré une fois : la distance entre son centre et celui
 * de la grille) et l'applique multiplié par `1 - --stack`. Le défilement écrit donc un
 * nombre par case et par image : pas de recalcul de mise en page, une seule lecture de rect.
 *
 * `prefers-reduced-motion` reçoit la grille définitive, immobile, sans hauteur
 * supplémentaire — le réglage refuse le mouvement, pas la page.
 *
 * La grille reste un `<ol>` : la sémantique de liste numérotée est celle de la page, la
 * transformation n'est qu'un habillage — rien n'est déplacé dans le DOM.
 */

/** Hauteur de la scène épinglée, en hauteurs de fenêtre (voir `globals.css`). */
const STAGE_VH = 170;

/** Position du collage, en fraction de la hauteur de fenêtre (doit valoir le `top` du CSS). */
const PIN = 0.12;

/** Part de la course d'épinglage pendant laquelle l'ouverture se joue. */
const TRAVEL = 0.85;

/** Retard d'ouverture d'une case sur la précédente, en fraction de la course. */
const STAGGER = 0.1;

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
};

export default function ScrollStack({ children, className = "" }: ScrollStackProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const grid = gridRef.current;
    if (!stage || !grid) return;

    const items = Array.from(grid.children) as HTMLElement[];
    let frame = 0;

    /** Distance entre le centre de chaque case et celui de la grille (valeurs de mise en page). */
    const measure = () => {
      const cx = grid.clientWidth / 2;
      const cy = grid.clientHeight / 2;

      items.forEach((item) => {
        const dx = cx - (item.offsetLeft + item.offsetWidth / 2);
        const dy = cy - (item.offsetTop + item.offsetHeight / 2);
        item.style.setProperty("--stack-x", `${Math.round(dx)}px`);
        item.style.setProperty("--stack-y", `${Math.round(dy)}px`);
      });
    };

    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const pinTop = window.innerHeight * PIN;
      /* Course utile : ce que la scène mesure au-delà de la grille, c'est-à-dire le temps
         pendant lequel la grille reste collée. */
      const travel = Math.max(1, (stage.offsetHeight - grid.offsetHeight) * TRAVEL);
      const progress = Math.min(1, Math.max(0, (pinTop - rect.top) / travel));

      /* Grille ouverte : la vidéo de l'illustration est retirée du rendu (voir
         `globals.css`). Elle n'a plus rien à montrer sous la photo, et un média qui decode
         des images invisibles est exactement le coût qu'on évite partout ailleurs. */
      stage.dataset.open = progress >= 0.99 ? "true" : "false";

      /* Chaque case a sa propre course : elle démarre quand la précédente est déjà en
         route, et se pose en douceur (sortie cubique). La première part à 0, la dernière
         finit exactement à 1. */
      items.forEach((item, index) => {
        const start = index * STAGGER;
        const local = Math.min(1, Math.max(0, (progress - start) / (1 - start)));
        const eased = 1 - Math.pow(1 - local, 3);
        item.style.setProperty("--stack", eased.toFixed(4));
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const setup = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        stage.dataset.stack = "off";
        stage.dataset.open = "true";
        items.forEach((item) => item.style.setProperty("--stack", "1"));
        return;
      }

      stage.dataset.stack = "on";
      measure();
      update();
    };

    setup();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    /* Les retours à la ligne du titre, le chargement des images et la restauration de la
       position de défilement changent la hauteur des cases : on remesure plutôt que de
       garder des décalages faux. */
    const observer = new ResizeObserver(() => {
      if (stage.dataset.stack !== "on") return;
      measure();
      schedule();
    });
    observer.observe(grid);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      /* `off` par défaut : hors JavaScript (ou avant l'hydratation), la scène n'a ni hauteur
         supplémentaire ni épinglage — la page est celle du rendu final. */
      data-stack="off"
      style={{ "--stage-vh": STAGE_VH } as CSSProperties}
      className="relative"
    >
      <ol
        ref={gridRef}
        /* `relative` n'est pas décoratif : il fait de la grille le repère des `offsetLeft` /
           `offsetTop` lus pendant la mesure, et les rend insensibles aux transforms déjà
           appliquées aux cases. */
        className={`stack-grid relative ${className}`}
      >
        {children}
      </ol>
    </div>
  );
}
