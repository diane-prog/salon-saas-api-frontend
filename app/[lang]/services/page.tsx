import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CtaBand from "@/components/CtaBand";
import { HeroSection, ServiceGrid } from "@/components/sections";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.servicesPage.title,
    description: dict.servicesPage.lead,
    alternates: { canonical: localePath(lang, "/services") },
  };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { servicesPage, ui } = dict;

  return (
    <>
      <HeroSection eyebrow={ui.expertise} title={servicesPage.title} body={servicesPage.lead} />
      <section className="py-24 sm:py-28">
        <div className="container-x">
          <ServiceGrid />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
