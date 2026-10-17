import ActionDock from "@/components/ActionDock";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageFade from "@/components/PageFade";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";

/**
 * Coquille du SITE PUBLIC — landing, pages de service, réalisations, contact, devis.
 *
 * Ce que ce fichier fait, et pourquoi il existe : tout ce qui habille la vitrine
 * a été sorti du layout de langue pour que les autres surfaces n'en héritent
 * plus. Un écran d'accès n'a rien à faire avec une barre de navigation, un pied
 * de page commercial, une barre d'actions flottante ni un défilement lissé ; le
 * tableau de bord, lui, a besoin du défilement NATIF (des tableaux qu'on
 * parcourt ne doivent pas être interpolés).
 *
 * Les groupes de routes `(site)` et `(auth)` sont transparents pour l'URL :
 * `/fr/a-propos` reste `/fr/a-propos`. Seul l'habillage change.
 *
 * `PageTransition` reste ICI et non plus à la racine : c'est le rideau du site
 * marketing, et il fournit le contexte `usePageTransition` dont `Header` et
 * `ActionDock` dépendent — les deux sont dans ce fichier.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <Header />
      <main className="flex-1">
        <PageFade>{children}</PageFade>
      </main>
      <Footer />
      {/* Barre d'actions flottante : dans `PageTransition`, donc sous le rideau comme
          le reste de la page — elle n'a rien à faire au-dessus d'une transition. */}
      <ActionDock />
      <SmoothScroll />
    </PageTransition>
  );
}
