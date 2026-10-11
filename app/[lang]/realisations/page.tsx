import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CtaBand from "@/components/CtaBand";
import { HeroSection } from "@/components/sections";
import ProjectFilter from "@/components/ProjectFilter";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/realisations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.ui.portfolio,
    description: dict.ui.testimonialBody,
    alternates: { canonical: localePath(lang, "/realisations") },
  };
}

export default async function RealisationsPage({ params }: PageProps<"/[lang]/realisations">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <HeroSection
        eyebrow={dict.ui.portfolio}
        title={lang === "fr" ? "Nos réalisations" : "Our work"}
        body={
          lang === "fr"
            ? "Découvrez quelques-uns de nos projets qui ont transformé la présence digitale de nos clients."
            : "Discover some of the projects that have transformed our clients' digital presence."
        }
      />
      <section className="py-24 sm:py-28">
        <div className="container-x">
          <ProjectFilter projects={dict.projects} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
