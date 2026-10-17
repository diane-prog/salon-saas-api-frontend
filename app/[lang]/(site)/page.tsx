import CtaBand from "@/components/CtaBand";
import FaqSection from "@/components/FaqSection";
import HomeHero from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import PricingSection from "@/components/PricingSection";
import SalonDemo from "@/components/SalonDemo";
import ServicesEditorial from "@/components/ServicesEditorial";
import Testimonials from "@/components/Testimonials";
import WhyStatements from "@/components/WhyStatements";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/dictionaries";

/**
 * Accueil — la page doit répondre, en une lecture, à « c'est quoi, pour moi ? ».
 *
 * ORDRE ET CE QUI A CHANGÉ PAR RAPPORT AU SITE PRÉCÉDENT :
 *
 *  1. `HomeHero` — la promesse ;
 *  2. `WhyStatements` — les trois raisons, réécrites pour un salon ;
 *  3. `ServicesEditorial` — les six fonctionnalités en liste numérotée ;
 *  4. `SalonDemo` — le salon de démonstration en direct : son nom, ses couleurs,
 *     ses prestations et son équipe, sans maquette d'écran ;
 *  5. `PricingSection` — les quatre forfaits ;
 *  6. `Testimonials` — les mots des clientes : un rail plein cadre, qui défile
 *     seul, et dont l'image de la case active devient le fond de la section.
 *     Placé APRÈS les forfaits : on montre d'abord ce que ça coûte, puis ce que
 *     les autres en disent — l'inverse faisait lire les prix après coup.
 *  7. `FaqSection` — les questions fréquentes ;
 *  8. `CtaBand` — ouvrir un salon.
 *
 * TROIS SECTIONS ONT ÉTÉ RETIRÉES, et pas par oubli : elles affichaient du
 * contenu de l'ancienne agence, qui n'existe plus ici —
 *
 *   - la galerie de projets (études de cas) : sans captures produit, un « cas
 *     client » n'est que la photo d'un client d'agence. Elle reviendra en
 *     démonstration produit dessinée en HTML ;
 *   - `ClientsWall` (mur de logos) : les douze logos sont ceux de clients d'une
 *     agence ; les présenter comme des salons serait faux ;
 *   - `TestimonialsSection` : les témoignages parlent de campagnes et de
 *     refontes. Le salon de démonstration n'a qu'un avis réel — la section
 *     reviendra branchée sur `GET /public/{slug}/reviews`.
 *
 * Le rendu des trois composants existants est intact : c'est leur CONTENU qui
 * manque, et il viendra des vraies données.
 */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <HomeHero />

      {/* Section « Pourquoi Belora » : l'en-tête hors grille, puis trois raisons
          numérotées 01 → 03 et l'illustration qui ferme la dernière ligne. */}
      <WhyStatements />

      {/* Les six fonctionnalités, en liste éditoriale numérotée. */}
      <ServicesEditorial />

      {/* Le salon de démonstration, en direct depuis l'API : nom, couleurs,
          prestations et équipe, présentés en éditorial. */}
      <SalonDemo />

      {/* Forfaits — valeurs statiques : l'API des tarifs refuse les requêtes
          sans jeton (voir le commentaire de `pricing`). */}
      <PricingSection />

      {/* Les mots, APRÈS les forfaits : la preuve vient après le prix. Rail
          plein cadre, défilement automatique, fond tiré de la case active. La
          section disparaît d'elle-même sans citation — pas de coquille vide. */}
      <Testimonials />

      {/* Questions fréquentes — mêmes mots que le JSON-LD juste en dessous. */}
      <FaqSection faq={dict.faq} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: dict.faq.items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <CtaBand />
    </>
  );
}
