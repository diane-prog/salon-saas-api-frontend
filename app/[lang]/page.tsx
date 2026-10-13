import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import HomeHero from "@/components/HomeHero";
import ServicesGlass from "@/components/ServicesGlass";
import WhyStatements from "@/components/WhyStatements";
import ProjectCommunity from "@/components/ProjectCommunity";
import {
  ClientsMarquee,
  StatsSection,
  TestimonialsSection,
} from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;
  const { stats, clients, ui } = dict;

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

      <section className="py-20">
        <div className="container-x">
          <SectionHeading eyebrow={ui.references} title={ui.clientsTitle} align="center" />
        </div>
        <div className="mt-12">
          <ClientsMarquee items={clients} />
        </div>
        <div className="container-x mt-10 flex justify-center">
          <Reveal>
            <Link
              href={href("/realisations")}
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              {ui.clientsLink}
            </Link>
          </Reveal>
        </div>
      </section>

      <TestimonialsSection />

      <CtaBand />
    </>
  );
}
