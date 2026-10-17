import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";

/**
 * Coquille du SITE PUBLIC — landing, pages de service, réalisations, contact.
 *
 * Ce que ce fichier fait, et pourquoi il existe : tout ce qui habille la vitrine
 * a été sorti du layout de langue pour que les autres surfaces n'en héritent
 * plus. Un écran d'accès n'a rien à faire avec une barre de navigation, un pied
 * de page commercial ni un défilement lissé ; le tableau de bord, lui, a besoin
 * du défilement NATIF (des tableaux qu'on parcourt ne doivent pas être
 * interpolés).
 *
 * Les groupes de routes `(site)` et `(auth)` sont transparents pour l'URL :
 * `/fr/a-propos` reste `/fr/a-propos`. Seul l'habillage change.
 *
 * PLUS DE BARRE D'ACTIONS FLOTTANTE (2026-10-17) : elle tenait l'écran en bas de
 * chaque page — devis, contact, assistant, éventail de réseaux — et c'est elle qui
 * portait le seul formulaire de contact du site. Elle est retirée du rendu : joindre la
 * maison passe désormais par la fiche de `/contact` (courriel et téléphone, liens natifs),
 * et les réseaux ont rejoint le pied de page, qui est leur place.
 *
 * `PageTransition` reste ICI et non à la racine : c'est la transition du site marketing, et
 * elle fournit le contexte `usePageTransition` dont `Header` dépend.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SmoothScroll />
    </PageTransition>
  );
}
