import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusion de classes Tailwind — comme dans `ldmgV/ldmgwebsiteft/lib/utils.ts`.
 *
 * `clsx` résout les conditions (`false`, `undefined`, tableaux, objets), puis
 * `twMerge` supprime les conflits : `cn("p-2", "p-6")` rend « p-6 » et non
 * « p-2 p-6 ». Nécessaire aux primitives shadcn, qui reçoivent `className` du
 * parent et doivent pouvoir le laisser gagner.
 *
 * Le reste du site (composants belora) n'utilise pas `cn` : il compose ses
 * classes en gabarits de chaînes. Les deux cohabitent, `cn` est réservé aux
 * primitives importées.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
