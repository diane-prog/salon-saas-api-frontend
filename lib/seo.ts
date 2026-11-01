import type { Metadata } from "next";

import { localePath, localeTags, locales, type Locale } from "@/lib/dictionaries";

/**
 * Adresse canonique du site.
 *
 * Elle était écrite en dur avec le domaine de l'ancienne agence — donc fausse pour
 * Belora, et présente dans toutes les balises canoniques, le sitemap, le robots.txt et
 * les données structurées. Elle vient maintenant de l'environnement, pour que le
 * lancement sur le vrai domaine ne soit qu'une variable à poser (`NEXT_PUBLIC_SITE_URL`,
 * documentée dans le README).
 *
 * Le repli n'est pas décoratif : sans la variable, un build local produirait des
 * canoniques pointant sur un domaine inconnu. `belora.app` est le domaine produit de
 * référence ; il se remplace en une ligne le jour du lancement.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://belora.app").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Belora";

/**
 * Armel Dakayao — développement du produit (portfolio).
 *
 * Le crédit est porté par les métadonnées et les données structurées : c'est ce
 * qui relie la recherche du nom aux pages réellement construites, sans ajouter
 * un bloc visuel au site.
 */
export const AUTHOR = {
  name: "Armel Dakayao",
  url: "https://armeldakayao.com",
  jobTitle: "Senior Front-End Developer",
  sameAs: [
    "https://armeldakayao.com",
    "https://www.linkedin.com/in/armeldakayao/",
    "https://github.com/Armeldakayao",
  ],
};

export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  noIndex?: boolean;
};

/**
 * Métadonnées d'une page interne.
 *
 * Sans lui, une page enfant qui déclare son `title` héritait de l'Open Graph du
 * layout — donc d'un aperçu social identique partout. Ici, le titre, la
 * description, l'URL et les variantes de langue suivent la page.
 */
export function pageMetadata({
  title,
  description,
  path,
  locale,
  noIndex = false,
}: PageMetadata): Metadata {
  const canonical = localePath(locale, path);
  const url = absoluteUrl(canonical);

  const languages: Record<string, string> = {};
  for (const other of locales) {
    languages[localeTags[other]] = localePath(other, path);
  }

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
