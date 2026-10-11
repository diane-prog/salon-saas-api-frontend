export const SITE_URL = "https://www.leegigroup.com";

export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export const SEO = {
  title: "LEEGI Group — Agence de communication digitale à Dakar",
  description:
    "LEEGI Group transforme votre visibilité en clients, en crédibilité et en croissance. Branding, sites web, SEO, contenu et événementiel à Dakar.",
  ogImage: "/opengraph-image",
} as const;