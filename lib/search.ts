export type SearchEntry = { label: string; href: string; group: string };

export type SearchSource = {
  services: { slug: string; title: string }[];
  projects: { title: string }[];
  nav: { label: string; href: string }[];
  groups: { expertise: string; portfolio: string; presentation: string };
};

/** Construit l'index de recherche (services, réalisations, pages) pour une langue donnée. */
export function buildSearchEntries(source: SearchSource, locale: string): SearchEntry[] {
  const prefix = (path: string) => `/${locale}${path === "/" ? "" : path}`;
  return [
    ...source.services.map((service) => ({
      label: service.title,
      href: prefix(`/services/${service.slug}`),
      group: source.groups.expertise,
    })),
    ...source.projects.map((project) => ({
      label: project.title,
      href: prefix("/realisations"),
      group: source.groups.portfolio,
    })),
    ...source.nav.map((item) => ({
      label: item.label,
      href: prefix(item.href),
      group: source.groups.presentation,
    })),
  ];
}

/** Insensible à la casse et aux accents : « evenementiel » trouve « Événementiel ». */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Renvoie au plus `limit` entrées dont le libellé contient la recherche (2 caractères minimum). */
export function searchEntries(entries: SearchEntry[], query: string, limit = 6): SearchEntry[] {
  const term = normalize(query.trim());
  if (term.length < 2) return [];
  return entries.filter((entry) => normalize(entry.label).includes(term)).slice(0, limit);
}
