import type { MetadataRoute } from "next";
import { getDictionary, locales } from "@/lib/dictionaries";
import { absoluteUrl } from "@/lib/seo";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/a-propos", "/services", "/realisations", "/contact", "/devis"];

  const entries = await Promise.all(
    locales.map(async (lang) => {
      const dict = await getDictionary(lang);

      const staticPages = routes.map((r) => ({
        url: absoluteUrl(`/${lang}${r}`),
        lastModified: new Date("2026-01-01"),
        changeFrequency: "monthly" as const,
        priority: r === "" ? 1 : 0.8,
      }));

      const servicePages = dict.services.map((s) => ({
        url: absoluteUrl(`/${lang}/services/${s.slug}`),
        lastModified: new Date("2026-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

      return [...staticPages, ...servicePages];
    }),
  );

  return entries.flat();
}