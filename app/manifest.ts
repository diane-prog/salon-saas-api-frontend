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
 * POURQUOI AUCUNE ICÔNE `maskable` : Android rogne ces icônes dans un cercle. Le mark est posé
 * à 76 % de la hauteur du carré (voir `scripts/make-icons.py`) — il serait coupé. On déclare
 * donc les icônes en `any` seulement.
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
    /* Le navy du carré de l'icône : l'écran de lancement ne clignote donc pas d'une autre
       couleur que celle de l'icône. */
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
