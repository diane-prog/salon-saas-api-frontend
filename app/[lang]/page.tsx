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

      <StatsSection stats={stats} />

      {/* Section « Pourquoi nous choisir » : grille éditoriale de huit tuiles — une
          en-tête (sur-titre + titre), cinq raisons numérotées 01 → 05 et deux photos
          insérées dans le flux. */}
      <WhyStatements />

      <ServicesGlass
        eyebrow={ui.expertise}
        title={lang === "fr" ? "Nos Services" : "Our Services"}
        body={
          lang === "fr"
            ? "Nous accompagnons les entreprises africaines et leurs partenaires à chaque étape de leur développement digital."
            : "We support African companies and their partners at every stage of their digital development."
        }
      />

      <ProjectCommunity />

      {/* Section « Nos Clients » : le titre au centre, les logos des clients posés autour
          comme des vignettes, reliés par de fins arcs. Le titre et le lien lui sont passés
          pour qu'ils prennent place DANS le champ. */}
      <ClientsWall
        eyebrow={ui.references}
        title={ui.clientsTitle}
        linkHref={href("/realisations")}
        linkLabel={ui.clientsLink}
      />

      <TestimonialsSection />

      <CtaBand />
    </>
  );
}
