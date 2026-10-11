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

    const lenis = new Lenis({
      lerp: 0.11,
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

  // Nouvelle page : on repart du haut, puis on recalcule les déclencheurs une fois la mise en page faite.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    scrollToTop(true);
    // Après l'animation d'entrée de page : les sections épinglées (services) seraient
    // mesurées pendant que l'ancêtre porte encore un `transform`.
    const id = window.setTimeout(() => {
      if (pluginReady) ScrollTrigger.refresh();
    }, 900);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
