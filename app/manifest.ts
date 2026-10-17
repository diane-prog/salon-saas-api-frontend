import type { MetadataRoute } from "next";
import { defaultLocale, getDictionary, localeTags } from "@/lib/dictionaries";

/**
 * Manifeste web : ce que le navigateur lit quand on installe le site sur un écran d'accueil
 * (Android surtout, iOS lisant plutôt `apple-icon`). Rien n'y est inventé — le nom,
 * l'accroche et la langue viennent du dictionnaire, comme le reste du site.
 *
 * POURQUOI `start_url` VISE LA LANGUE PAR DÉFAUT et non `/` : `/` est redirigé vers `/fr`, ce
 * qui ajouterait un aller-retour au lancement depuis l'écran d'accueil.
 *
 * POURQUOI AUCUNE ICÔNE `maskable` : Android rogne ces icônes dans un cercle. Le sujet (le
 * monogramme et son point de laiton) est centré sur environ 70 % de la largeur du carré — il
 * serait rogné. On déclare donc les icônes en `any` seulement.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dict = await getDictionary(defaultLocale);

  return {
    name: dict.site.name,
    short_name: dict.site.name.split(" ")[0],
    description: dict.site.tagline,
    lang: localeTags[defaultLocale],
    start_url: `/${defaultLocale}`,
    scope: "/",
    display: "standalone",
    /* L'ENCRE du carré de l'icône (`app/icon.png`, voir `scripts/make-icons.py`) : l'écran de
       lancement ne clignote donc pas d'une autre couleur que celle de l'icône. */
    background_color: "#15110e",
    theme_color: "#15110e",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
