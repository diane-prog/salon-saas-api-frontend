import CtaBand from "@/components/CtaBand";
import HomeHero from "@/components/HomeHero";
import ServicesGlass from "@/components/ServicesGlass";
import WhyStatements from "@/components/WhyStatements";
import ProjectCommunity from "@/components/ProjectCommunity";
import ClientsWall from "@/components/ClientsWall";
import { StatsSection, TestimonialsSection } from "@/components/sections";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;
  const { stats, ui } = dict;

  return (
    <>
      <HomeHero />

      {/* Section « Pourquoi nous choisir » : grille éditoriale de huit tuiles — une
          en-tête (sur-titre + titre), cinq raisons numérotées 01 → 05 et deux photos
          insérées dans le flux. */}
      <WhyStatements />

      <ServicesGlass title={ui.servicesTitle} body={ui.servicesBody}>
        {/* Les résultats sont passés en ENFANT (et non posés en voisin) pour rester dans la
            section : c'est la boîte de la section qui sert de repère à la vidéo collée, donc
            le bloc défile par-dessus le média — et le plan de ce média vire progressivement
            au sien pendant qu'il monte (voir `ServicesGlass`). */}
        <StatsSection
          title={ui.statsTitle}
          body={ui.statsBody}
          linkHref={href("/realisations")}
          linkLabel={ui.viewAllProjects}
          stats={stats}
        />
      </ServicesGlass>

      <ProjectCommunity />

      {/* Section « Nos Clients » : le titre dans la marge de gauche, le tableau de
          logotypes à droite. Le titre et le lien lui sont passés pour la colonne de gauche. */}
      <ClientsWall
        title={ui.clientsTitle}
        linkHref={href("/realisations")}
        linkLabel={ui.clientsLink}
      />

      <TestimonialsSection />

      <CtaBand />
    </>
  );
}
