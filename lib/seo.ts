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

export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
