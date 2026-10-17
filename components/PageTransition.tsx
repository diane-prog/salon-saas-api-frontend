"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type TransitionApi = {
  /** `hard: true` ⇒ navigation pleine page (changement de langue). */
  navigate: (href: string, options?: { hard?: boolean }) => void;
};

// Repli sûr si le fournisseur n'est pas monté : navigation classique plutôt qu'un clic sans effet.
const TransitionContext = createContext<TransitionApi>({
  navigate: (href) => {
    if (typeof window !== "undefined") window.location.assign(href);
  },
});

/** Change de page depuis n'importe quel composant client (aujourd'hui : la langue du site). */
export function usePageTransition() {
  return useContext(TransitionContext);
}

/**
 * Transition entre les pages : UN FONDU, rien d'autre.
 *
 * La page d'arrivée monte de 0,4 à pleine opacité en 260 ms (`.page-enter` dans
 * `globals.css`), sur un nœud neuf — `key={pathname}` — donc le fondu rejoue à chaque page.
 *
 * CE QUI A ÉTÉ ESSAYÉ PUIS RETIRÉ le 2026-10-17, parce que chacun ajoutait du bruit ou du
 * coût sans rien apporter :
 *   - un rideau plein écran qui tombait d'en haut, puis un balayage horizontal : les deux
 *     recouvraient le contenu et retardaient la lecture ;
 *   - un fondu de SORTIE avec translation de la page entière : une `transform` sur le
 *     conteneur qui porte toute la page se re-rastérise à chaque image (l'à-coup signalé) et
 *     crée un containing block qui casse les sections épinglées par ScrollTrigger ;
 *   - une règle de progression de 2 px en haut de l'écran ;
 *   - l'interception des clics pour chorégraphier la sortie : elle n'a plus de raison d'être
 *     sans animation de sortie, et c'est autant de code retiré du chemin d'un clic.
 *
 * Ce qui reste est joué par le compositeur seul : une opacité, aucune transformation. Les
 * liens repassent donc par le `<Link>` de Next.js, qui navigue côté client (et précharge les
 * pages à portée d'écran) — le fondu n'est qu'un habillage de l'arrivée.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (href: string, options?: { hard?: boolean }) => {
      if (typeof window === "undefined") return;
      /* Navigation pleine page : c'est le passage obligé du changement de LANGUE, qui remonte
         tout le sous-arbre `[lang]` — donc ce composant. */
      if (options?.hard) {
        window.location.assign(href);
        return;
      }
      router.push(href);
    },
    [router],
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      <div key={pathname} className="page-enter">
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
