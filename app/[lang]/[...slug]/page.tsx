import { notFound } from "next/navigation";

/**
 * Route attrape-tout : toute URL inconnue sous `/[lang]` termine ici et déclenche la
 * 404 du segment (`app/[lang]/not-found.tsx`), qui s'affiche DANS la layout — styles,
 * header et footer compris.
 *
 * Sans cette route, Next rend `app/not-found.tsx` (racine) : ce fichier est hors de
 * toute layout, donc sans CSS, et la page apparaît brute.
 */
/* Paramètres inconnus au build : `usePathname` (header, transitions de page) se met en
   attente pendant le prerender. `instant = false` autorise cette route à être rendue au
   moment de la requête — ce qui est exactement le cas d'une 404. */
export const instant = false;

export default function CatchAll() {
  notFound();
}
