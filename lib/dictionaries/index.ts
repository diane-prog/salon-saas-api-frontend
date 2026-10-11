export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const loaders = {
  fr: () => import("./fr").then((m) => m.default ?? m),
  en: () => import("./en").then((m) => m.default ?? m),
};

export type Dictionary = Awaited<ReturnType<(typeof loaders)["fr"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]() as Promise<Dictionary>;
}

/** Builds an absolute, locale-aware URL: `/fr/services/seo`. */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

export function switchLocalePath(locale: Locale, pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  return localePath(locale, `/${parts.join("/")}`);
}

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

/** BCP-47 tags for hreflang attributes. */
export const localeTags: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en",
};