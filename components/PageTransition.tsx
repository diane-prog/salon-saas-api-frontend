"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SplitText from "@/components/SplitText";
import { useDictionary } from "@/components/DictionaryProvider";
import { CURTAIN, EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import { scrollToTop } from "@/lib/scroll";

type Phase = "idle" | "cover" | "reveal";
type TransitionApi = { navigate: (href: string, label?: string) => void };

// Repli sûr si le fournisseur n'est pas monté : navigation classique plutôt qu'un clic sans effet.
const TransitionContext = createContext<TransitionApi>({
  navigate: (href) => {
    if (typeof window !== "undefined") window.location.assign(href);
  },
});

/** Ouvre le rideau de transition depuis n'importe quel composant client. */
export function usePageTransition() {
  return useContext(TransitionContext);
}

/**
 * Transition de page « rideau flip » :
 * un panneau plein écran se déploie depuis le haut (rotation 3D), affiche le libellé
 * du lien cliqué pendant que la navigation se fait, puis se retire en pivotant.
 *
 * Tous les liens internes sont interceptés en phase de capture : `event.preventDefault()`
 * empêche Next.js de naviguer immédiatement (next/link abandonne quand l'événement est
 * déjà annulé) tout en laissant les `onClick` React s'exécuter (fermeture du menu mobile…).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { dict, locale } = useDictionary();

  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");

  const phaseRef = useRef<Phase>("idle");
  const pending = useRef<string | null>(null);
  const coverStartedAt = useRef(0);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  /** Route -> libellé, pour les liens sans texte exploitable (logo, icônes, retour navigateur). */
  const routeLabels = useMemo(() => {
    const base = `/${locale}`;
    const map: Record<string, string> = {};
    for (const item of dict.nav) map[`${base}${item.href === "/" ? "" : item.href}`] = item.label;
    for (const service of dict.services) map[`${base}/services/${service.slug}`] = service.title;
    map[`${base}/devis`] = dict.ui.freeQuote;
    return map;
  }, [dict, locale]);

  /** Devine le libellé affiché au centre du rideau à partir du lien cliqué. */
  const labelFor = useCallback(
    (anchor: HTMLAnchorElement, path: string): string => {
      const explicit = anchor.dataset.transitionLabel?.trim();
      if (explicit) return explicit;

      const heading = anchor.querySelector("h1, h2, h3, h4")?.textContent?.replace(/\s+/g, " ").trim();
      if (heading) return heading;

      const strong = anchor
        .querySelector("[class*='font-semibold']")
        ?.textContent?.replace(/\s+/g, " ")
        .trim();
      if (strong && strong.length <= 40) return strong;

      const own = (anchor.textContent ?? "").replace(/\s+/g, " ").trim();
      if (own && own.length <= 28) return own;

      const route = path.replace(/\/+$/, "") || path;
      if (routeLabels[route]) return routeLabels[route];

      const aria = anchor.getAttribute("aria-label")?.trim();
      if (aria) return aria;

      return own.slice(0, 42) || dict.nav[0]?.label || "";
    },
    [dict.nav, routeLabels],
  );

  const labelForRef = useRef(labelFor);
  useEffect(() => {
    labelForRef.current = labelFor;
  }, [labelFor]);

  /** Lance le rideau puis navigue pendant qu'il couvre l'écran. */
  const start = useCallback(
    (href: string, nextLabel: string) => {
      clearTimers();
      coverStartedAt.current = performance.now();
      pending.current = href.split("?")[0].split("#")[0];
      setLabel(nextLabel);
      setPhase("cover");

      timers.current.push(
        window.setTimeout(() => {
          router.push(href);
          // Filet de sécurité : la navigation n'a pas abouti, on retire le rideau quand même.
          timers.current.push(
            window.setTimeout(() => {
              if (phaseRef.current === "cover") setPhase("reveal");
            }, CURTAIN.maxWaitMs),
          );
        }, CURTAIN.coverMs),
      );
    },
    [clearTimers, router],
  );

  const navigate = useCallback(
    (href: string, nextLabel?: string) => {
      if (typeof window === "undefined" || phaseRef.current !== "idle") return;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      const path = href.split("?")[0].split("#")[0];
      start(href, nextLabel ?? routeLabels[path] ?? "");
    },
    [routeLabels, router, start],
  );

  // Interception de tous les liens internes (header, footer, cartes, résultats de recherche…).
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.dataset.noTransition !== undefined) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const raw = anchor.getAttribute("href") ?? "";
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      // Un rideau est déjà en vol : on bloque la navigation pour ne pas la court-circuiter.
      if (phaseRef.current !== "idle") {
        event.preventDefault();
        return;
      }

      // Accessibilité : sans animation, on laisse Next.js naviguer normalement.
      if (prefersReducedMotion()) return;

      event.preventDefault();
      start(url.pathname + url.search + url.hash, labelForRef.current(anchor, url.pathname));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Navigation aboutie (ou déclenchée autrement : boutons précédent/suivant, router.push…).
  useEffect(() => {
    const previous = lastPath.current;
    lastPath.current = pathname;
    if (previous === pathname) return;

    if (phaseRef.current === "cover") {
      if (pending.current === pathname) {
        // On laisse le panneau finir de se déployer, puis on marque une courte pause sur le libellé.
        const elapsed = performance.now() - coverStartedAt.current;
        const wait = Math.max(0, CURTAIN.coverMs - elapsed) + CURTAIN.holdMs;
        timers.current.push(window.setTimeout(() => setPhase("reveal"), wait));
      }
      return;
    }

    if (phaseRef.current === "idle" && !prefersReducedMotion()) {
      // Navigation non interceptée (bouton précédent/suivant, router.push direct) : rideau de courtoisie.
      const route = pathname.replace(/\/+$/, "") || pathname;
      coverStartedAt.current = performance.now();
      setLabel(routeLabels[route] ?? "");
      setPhase("cover");
      timers.current.push(window.setTimeout(() => setPhase("reveal"), CURTAIN.coverMs + 60));
    }
  }, [pathname, routeLabels]);

  // Le rideau se retire : la nouvelle page repart du haut, révélée par le panneau.
  useEffect(() => {
    if (phase !== "reveal") return;
    scrollToTop(true);
    const id = window.setTimeout(() => {
      setPhase("idle");
      pending.current = null;
      setLabel("");
    }, CURTAIN.revealMs);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Rendu inline (pas de portail) : le fournisseur est directement sous <body>,
  // aucun ancêtre transformé ne pourrait donc casser le position: fixed.
  const curtain =
    phase !== "idle" ? (
      <div className="pointer-events-none fixed inset-0 z-90 [perspective:1600px]">
        <CurtainPanel phase={phase} label={label} />
      </div>
    ) : null;


  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      {curtain}
      <div role="status" aria-live="polite" className="sr-only">
        {phase === "idle" ? "" : label}
      </div>
    </TransitionContext.Provider>
  );
}

/**
 * Panneau 3D du rideau. Un seul panneau est monté à la fois : couverture puis retrait.
 *
 * La rotation est une animation CSS (`curtain-cover` / `curtain-reveal`) : le navigateur
 * la compose hors du thread principal, là où la même rotation pilotée par JavaScript
 * tombait à ~20 fps. Le fond reste uni, car un grain ou un dégradé plein écran est
 * rastérisé à chaque image dans un plan en rotation.
 */
function CurtainPanel({ phase, label }: { phase: Exclude<Phase, "idle">; label: string }) {
  const covering = phase === "cover";

  return (
    <div
      className={`curtain-panel ${covering ? "curtain-cover" : "curtain-reveal"}`}
      style={
        {
          "--curtain-cover": `${CURTAIN.cover}s`,
          "--curtain-reveal": `${CURTAIN.reveal}s`,
        } as CSSProperties
      }
    >
      {/* Lueur locale sans `filter: blur()` : un flou de 90 px est recalculé à chaque image
          dans un plan en rotation (mesuré : ~30 fps → ~50 fps une fois retiré). */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(36,151,190,0.3),transparent_68%)]"
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-turquoise">
          LEEGI GROUP
        </span>

        <SplitText
          as="p"
          text={label}
          mode="on-mount"
          delay={CURTAIN.label}
          stagger={0.025}
          duration={0.46}
          className="max-w-[16ch] text-[clamp(2rem,7vw,5rem)] font-semibold uppercase leading-[1.02] tracking-[-0.02em] text-white"
        />

        <motion.span
          aria-hidden
          className="block h-px w-40 origin-left bg-gradient-to-r from-brand to-turquoise"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: covering ? 0.46 : 0.2,
            delay: covering ? CURTAIN.label : 0,
            ease: EASE_OUT,
          }}
        />
      </div>
    </div>
  );
}
