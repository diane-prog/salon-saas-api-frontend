"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { lenisStore, scrollToTop } from "@/lib/scroll";

let pluginReady = false;
function registerPlugin() {
  if (pluginReady) return;
  gsap.registerPlugin(ScrollTrigger);
  pluginReady = true;
}

/**
 * Défilement fluide (Lenis) synchronisé avec GSAP/ScrollTrigger.
 * Désactivé si l'utilisateur demande moins d'animations : le scroll natif reprend la main.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    registerPlugin();

    /*
     * RÉGLAGES DE FLUIDITÉ. Lenis lisse de deux façons, et le choix compte :
     *   - `lerp` : on se rapproche de la cible d'un pourcentage fixe À CHAQUE FRAME. La durée
     *     réelle dépend donc de la cadence d'affichage — la même molette produit une glisse
     *     plus courte sur un écran 144 Hz que sur un 60 Hz, et la course s'arrête sur un
     *     arrondi au pixel, pas sur une durée.
     *   - `duration` + `easing` : la course dure un TEMPS FIXE, quelle que soit la machine.
     *     C'est ce modèle qu'on garde : un geste = un temps de glisse, toujours le même.
     *
     * La courbe est une exponentielle sortante (celle que Lenis applique par défaut quand on
     * donne une durée) : le déplacement part franchement puis ralentit longuement. C'est ce
     * long ralentissement qui se lit comme de l'inertie, et non comme un à-coup.
     * 1,15 s est le point où ça reste vif : au-delà, la page semble répondre en retard.
     *
     * Le toucher reste NATIF (`syncTouch` à faux) : sur téléphone, piloter le défilement en
     * JavaScript casse l'inertie du système, qui est meilleure que la nôtre.
     */
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
      anchors: true,
    });
    lenisStore.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // Un seul rAF pour tout : Lenis avance, GSAP garde ses déclencheurs à jour.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisStore.current = null;
    };
  }, []);

  /*
   * Nouvelle page : on repart du haut, puis on recalcule les déclencheurs une fois la mise
   * en page faite. C'est le SEUL endroit qui remet le défilement à zéro — `PageTransition`
   * ne s'en occupe plus, pour ne pas faire deux remises à zéro concurrentes.
   *
   * Le délai avant `refresh()` est court (300 ms) : il doit seulement laisser le nouveau
   * contenu se poser. Il était de 900 ms du temps où la page d'arrivée était animée avec une
   * `transform` sur son conteneur — un `refresh()` pendant cette animation mesurait des
   * positions fausses. La transition n'anime plus aucune transformation de page (voir
   * `PageTransition`), donc l'attente n'a plus de raison d'être : elle ne produisait qu'un
   * recalcul tardif, perceptible pendant la lecture.
   */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    scrollToTop(true);
    const id = window.setTimeout(() => {
      if (pluginReady) ScrollTrigger.refresh();
    }, 300);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
