import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

const SLUG = "contenu-reels-spots";

export async function generateMetadata({ params }: PageProps<"/[lang]/services/contenu-reels-spots">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const service = dict.services.find((s) => s.slug === SLUG);
  if (!service) return {};
  return {
    title: service.heroTitle,
    description: service.short,
    alternates: { canonical: localePath(lang, `/services/${SLUG}`) },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/services/contenu-reels-spots">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const service = dict.services.find((s) => s.slug === SLUG);
  if (!service) notFound();

  return <ServicePageTemplate service={service} />;
}
