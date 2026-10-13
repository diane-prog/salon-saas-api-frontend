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

      {/* Les résultats ferment la page : juste avant le bandeau de conclusion, ils
          transforment la promesse en preuve au moment où l'on demande le devis — et la
          section ne coupe plus le récit entre l'accroche du hero et le « pourquoi nous ».
          Le plan (affiche + vidéo) est dans la section ; la copie est passée ici, comme
          pour les services. */}
      <StatsSection
        eyebrow={lang === "fr" ? "Résultats" : "Results"}
        title={
          lang === "fr" ? "Des résultats concrets, pas des promesses." : "Proven results, not promises."
        }
        body={
          lang === "fr"
            ? "Une décennie de campagnes, de sites et d'identités de marque pour des entreprises africaines et leurs partenaires. Voici ce que cela donne, chiffres en main."
            : "A decade of campaigns, websites and brand identities for African companies and their partners. Here is what that looks like, in numbers."
        }
        stats={stats}
      />

      <CtaBand />
    </>
  );
}
