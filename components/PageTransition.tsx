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
import SplitText from "@/components/SplitText";
import { useDictionary } from "@/components/DictionaryProvider";
import { CURTAIN, prefersReducedMotion } from "@/lib/motion";
import { scrollToTop } from "@/lib/scroll";

type Phase = "idle" | "intro" | "cover" | "reveal";
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
 * Transition de page « rideau qui glisse » :
 * un panneau beige plein écran descend du haut pour couvrir la page, affiche le libellé
 * du lien cliqué pendant que la navigation se fait, puis redescend en s'effaçant.
 * Un seul axe, fond uni, aucun dégradé.
 *
 * Tous les liens internes sont interceptés en phase de capture : `event.preventDefault()`
 * empêche Next.js de naviguer immédiatement (next/link abandonne quand l'événement est
 * déjà annulé) tout en laissant les `onClick` React s'exécuter (fermeture du menu mobile…).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { dict, locale } = useDictionary();

  /*
   * Rideau d'OUVERTURE dans le PREMIER rendu : au chargement direct de l'accueil, le
   * panneau est déjà dans le HTML servi, en pleine couverture (phase « intro », sans
   * animation d'entrée) — la page n'est donc jamais visible avant lui. Le monter après
   * coup (dans un effet), ou le faire descendre depuis `-100%`, laissait voir la page
   * une à deux frames avant que le rideau n'arrive. `usePathname()` est résolu aussi côté serveur : le HTML
   * rendu et le premier rendu client sont identiques, donc pas de décalage.
   * Mouvement réduit : le panneau est masqué en CSS (globals.css), la séquence se
   * déroule quand même pour que la phase retombe sur « idle ».
   */
  const route = pathname.replace(/\/+$/, "") || pathname;
  const isHomeRoute = route === `/${locale}`;
  /*
   * « intro » : panneau DÉJÀ couvrant au premier rendu (aucune animation d'entrée), puis
   * simple retrait. C'est ce qui garantit que la page d'accueil n'est jamais visible avant
   * le rideau : avec « cover », le panneau part de `translateY(-100%)`, donc la page
   * restait affichée le temps qu'il descende.
   */
  const [phase, setPhase] = useState<Phase>(isHomeRoute ? "intro" : "idle");
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

      /* Texte « titre » du lien : depuis le passage des graisses grasses à `font-light`,
         c'est cette classe qui marque le libellé principal dans une carte ou une tuile. */
      const strong = anchor
        .querySelector("[class*='font-light']")
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
      if (typeof window === "undefined") return;
      /* Un rideau est déjà en vol ? Le clic n'est PAS avalé pour autant : on part en
         navigation pleine page, qui repart d'un état propre. C'est ce qui évite le bouton
         mort du changement de LANGUE quand une transition précédente couvre encore l'écran
         (symptôme : « le rideau se bloque, je suis obligé d'actualiser »). La langue, elle,
         est déjà posée en cookie par l'appelant : l'arrivée se fait dans la bonne locale. */
      if (phaseRef.current !== "idle") {
        window.location.assign(href);
        return;
      }
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
      // Sauf si aucune navigation n'est en attente (ouverture du site : le rideau couvre
      // déjà le départ) — sinon un clic pendant l'ouverture serait purement avalé.
      if (phaseRef.current !== "idle") {
        if (pending.current === null) return;
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

  /**
   * Rideau d'OUVERTURE : au premier chargement du document sur l'accueil, le rideau est
   * posé couvrant (premier rendu, cf. plus haut), reste le temps d'une couverture + pause
   * puis se retire. Les autres pages gardent l'arrivée directe : un lien partagé vers
   * /services/… ne doit pas être retardé par une couverture.
   * Mouvement réduit : rien, comme partout ailleurs.
   */
  const introPlayed = useRef(false);
  useEffect(() => {
    /* Les pages intérieures gardent une arrivée directe : pas de couverture au chargement. */
    if (!isHomeRoute) return;
    /* Rien à faire si l'ouverture est déjà jouée, ni si la phase a déjà bougé : un second
       passage de l'effet (StrictMode en dev, fast refresh) ne doit pas relancer le rideau. */
    if (introPlayed.current || phaseRef.current !== "intro") return;

    /* Le panneau est déjà couvrant (premier rendu) : on ne pose ici que son retrait,
       depuis une frame pour ne pas poser d'état dans le corps de l'effet. */
    let raf = 0;
    let timer = 0;
    raf = window.requestAnimationFrame(() => {
      coverStartedAt.current = performance.now();
      setLabel(routeLabels[route] ?? "");

      /* Chronologie ancrée au début du DOCUMENT et non à l'hydratation : sinon une
         hydratation lente (dev, mobile) prolonge d'autant le temps pendant lequel la page
         reste cachée. On garde un minimum de pause pour que le libellé soit lisible. */
      const wait = Math.max(
        CURTAIN.holdMs,
        CURTAIN.coverMs + CURTAIN.holdMs - performance.now(),
      );
      timer = window.setTimeout(() => {
        /* Marqué seulement quand le retrait est réellement programmé (et non à l'entrée de
           l'effet) : en développement StrictMode monte l'effet deux fois. Marquer avant
           faisait annuler la frame par le nettoyage du premier passage, tandis que le
           second sortait aussitôt — le panneau ne se retirait jamais et l'accueil restait
           bloqué dessus. Ici le second passage retrouve la phase « intro » et reprogramme le retrait. */
        introPlayed.current = true;
        if (phaseRef.current === "intro") setPhase("reveal");
      }, wait);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [isHomeRoute, route, routeLabels]);

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

  /**
   * Chien de garde : le rideau ne doit JAMAIS rester en place.
   *
   * La séquence normale retombe toujours sur « idle » (navigation aboutie, puis filet de
   * sécurité de `start`). Mais un changement de LANGUE est un cas à part : la route d'arrivée
   * peut ne pas correspondre exactement à `pending` — redirection de la locale par défaut,
   * URL normalisée — et le rideau restait alors baissé, obligeant à actualiser la page.
   *
   * Ce minuteur est la dernière sortie de secours : armé dès qu'une phase est en vol, il
   * force le retour sur « idle » bien après la durée maximale de la séquence. Il est levé
   * par le nettoyage à chaque changement de phase, donc la séquence normale ne le voit pas.
   */
  useEffect(() => {
    if (phase === "idle") return;
    const id = window.setTimeout(() => {
      if (phaseRef.current === "idle") return;
      setPhase("idle");
      pending.current = null;
      setLabel("");
    }, CURTAIN.maxWaitMs + CURTAIN.revealMs + 500);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Rendu inline (pas de portail) : le fournisseur est directement sous <body>,
  // aucun ancêtre transformé ne pourrait donc casser le position: fixed.
  const curtain =
    phase !== "idle" ? (
      <div className="pointer-events-none fixed inset-0 z-90">
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
 * Panneau du rideau. Un seul panneau est monté à la fois : couverture puis retrait.
 *
 * L'animation est purement CSS (`curtain-cover` / `curtain-reveal`) : translation
 * verticale seule, fond d'ENCRE uni — le même que les panneaux plein écran de la recherche
 * et du formulaire, et que la barre de téléphone. Le rideau, la recherche et le formulaire
 * sont donc un seul objet visuel, et le libellé du rideau est CLAIR (papier), puisqu'il est
 * posé sur l'encre. Aucun dégradé ni aucune lueur — un dégradé plein écran se rastériserait
 * image par image, et le rendu demandé est volontairement sobre.
 */
function CurtainPanel({ phase, label }: { phase: Exclude<Phase, "idle">; label: string }) {
  const className =
    phase === "intro" ? "curtain-still" : phase === "cover" ? "curtain-cover" : "curtain-reveal";

  return (
    <div
      className={`curtain-panel ${className}`}
      style={
        {
          "--curtain-cover": `${CURTAIN.cover}s`,
          "--curtain-reveal": `${CURTAIN.reveal}s`,
        } as CSSProperties
      }
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-paper/60">
          LEEGI GROUP
        </span>

        <SplitText
          as="p"
          text={label}
          mode="on-mount"
          delay={CURTAIN.label}
          stagger={0.025}
          duration={0.46}
          className="max-w-[16ch] text-[clamp(2rem,7vw,5rem)] font-light uppercase leading-[1.02] tracking-[-0.02em] text-paper"
        />
      </div>
    </div>
  );
}
