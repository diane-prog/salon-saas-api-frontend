/**
 * Le vocabulaire « galerie » du site, en un seul endroit.
 *
 * Une seule échelle typographique, nommée une fois pour toutes, et un seul filet. Les
 * surfaces qui l'utilisent (page À propos, bandeau de conclusion, Réalisations, Services)
 * n'écrivent donc aucune taille en dur : ajuster le site revient à ajuster ce fichier.
 *
 * L'étalon est la liste des fondations de la page À propos — numéro en petites capitales,
 * titre en `font-light` à 20 px, phrase en 15 px. Tout le reste s'y range :
 *
 * - `TITLE` ne dépasse l'étalon que d'un cran (24 px), jamais plus ;
 * - `CLOSING` est la seule exception, réservée à l'affirmation de fin de page (le bandeau
 *   de conclusion) : un grand corps, mais toujours en `font-light` et jamais en gras ;
 * - `LABEL` porte toutes les étiquettes (sur-titres, numéros, méta) ;
 * - `RULE` est le seul ornement : un filet d'un pixel, en gris froid très clair.
 *
 * Les couleurs viennent du thème (`--color-paper`, `--color-ink` dans globals.css) et
 * l'accent, le bleu de marque, reste réservé aux survols.
 */

export const TITLE = "font-light text-2xl leading-snug";
export const LEAD = "text-[1.05rem] leading-[1.55]";
export const BODY = "text-[0.95rem] leading-relaxed";
export const ROW = "font-light text-xl";
export const SUB = "font-light text-lg";
export const LABEL = "text-[0.7rem] font-medium uppercase tracking-[0.2em]";
export const CLOSING = "font-light text-[clamp(1.6rem,3vw,2.75rem)] leading-[1.12]";

/** Filet de séparation : `navy` à 10 %, soit ≈ #E3E2E3 sur le papier. */
export const RULE = "border-navy/10";

/** Filet appuyé, pour un soulignement de lien qu'on doit voir au repos. */
export const RULE_STRONG = "border-navy/30";

/** Cadrage des photos : pleine couleur, jamais de filtre. */
export const PHOTO = "object-cover";

/** Placeholder neutre derrière une photo, le temps de son chargement. */
export const PHOTO_FRAME = "relative overflow-hidden bg-ink/[0.06]";
