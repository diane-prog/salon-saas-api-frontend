import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CtaBand from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import ServicesTable from "@/components/ServicesTable";
import { HeroSection } from "@/components/sections";
import { LABEL } from "@/lib/editorial";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    title: dict.servicesPage.title,
    description: dict.servicesPage.lead,
    path: "/services",
    locale: lang,
  });
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { servicesPage, ui } = dict;

  const breadcrumbs = breadcrumbJsonLd([
    { name: dict.nav[0].label, path: localePath(lang) },
    { name: dict.nav[1].label, path: localePath(lang, "/services") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />

      {/* Hero clair commun aux pages internes, inchangé. */}
      <HeroSection eyebrow={ui.expertise} title={servicesPage.title} body={servicesPage.lead} />

      {/* Une table éditoriale plutôt qu'une grille de cartes : étiquette dans la marge,
          six lignes de service à droite. */}
      <div className="bg-paper text-ink">
        <section className="container-x py-20 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-12">
            <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{ui.ourOffer}</span>
            <div className="lg:col-span-9">
              <ServicesTable />
            </div>
          </div>
        </section>

        <CtaBand />
      </div>
    </>
  );
}
