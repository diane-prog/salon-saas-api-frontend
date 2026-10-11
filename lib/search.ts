export type SearchEntry = { label: string; href: string; group: string };

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
