import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const SLUG = "agenda";

export async function generateMetadata({ params }: PageProps<"/[lang]/services/agenda">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const service = dict.services.find((s) => s.slug === SLUG);
  if (!service) return {};
  return pageMetadata({
    title: service.heroTitle,
    description: service.short,
    path: `/services/${SLUG}`,
    locale: lang,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/services/agenda">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const service = dict.services.find((s) => s.slug === SLUG);
  if (!service) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: dict.nav[0].label, path: localePath(lang) },
    { name: dict.nav[1].label, path: localePath(lang, "/services") },
    { name: service.title, path: localePath(lang, `/services/${SLUG}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ServicePageTemplate service={service} />
    </>
  );
}
