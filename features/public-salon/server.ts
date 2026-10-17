import { cache } from "react";

import type { SalonInfo } from "./types";

/**
 * Lecture **serveur** de l'identité publique d'un salon.
 *
 * Pourquoi elle existe, à côté des hooks clients : la vitrine `/[lang]/s/[slug]`
 * doit pouvoir répondre **404** quand le slug est inconnu, et annoncer le vrai
 * nom du salon dans ses métadonnées. Un composant client ne peut ni l'un ni
 * l'autre — il répondrait 200 avec un écran « introuvable », ce qui est un faux
 * 404 pour les moteurs ; et ses métadonnées seraient celles du site, pas celles
 * du salon.
 *
 * Elle n'utilise PAS `lib/axios-config` : ce client lit `localStorage`, qui
 * n'existe pas sur le serveur (le fichier le dit lui-même). Ici, un `fetch`
 * nu suffit, sur une route qui ne demande aucun jeton.
 *
 * Trois issues, et jamais une quatrième :
 *   - `ok` : le salon existe, on a son identité ;
 *   - `missing` : le serveur a répondu 404 — la page rend un vrai 404 ;
 *   - `unreachable` : l'API ne répond pas (réseau, 5xx, base absente). On ne
 *     sait rien du salon, donc on ne prétend rien : la page l'affiche.
 *
 * `cache()` déduplique l'appel entre `generateMetadata` et la page, qui tous les
 * deux ont besoin de la même réponse pendant la même requête.
 */
export type SalonLookup =
  | { readonly status: "ok"; readonly salon: SalonInfo }
  | { readonly status: "missing" }
  | { readonly status: "unreachable" };

/** Base absolue de l'API, suffixe `/api/v1` compris (même variable que le proxy). */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Au-delà, la vitrine affiche son état « injoignable » plutôt que de pendre. */
const TIMEOUT_MS = 4_000;

export const lookupSalon = cache(async (slug: string): Promise<SalonLookup> => {
  if (!API_BASE_URL || !slug || slug.length > 120) return { status: "unreachable" };

  try {
    const response = await fetch(
      `${API_BASE_URL}/public/${encodeURIComponent(slug)}/info`,
      {
        cache: "no-store",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "unreachable" };

    /* Les routes publiques enveloppent leur charge (`{ success, statusCode, data }`)
       — mesuré sur `info` — mais le Swagger montre parfois l'objet nu. Les deux
       formes sont acceptées, une seule est manipulée. */
    const payload = (await response.json()) as unknown;
    const salon = (
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { readonly data?: unknown }).data
        : payload
    ) as SalonInfo | undefined;

    if (!salon || typeof salon.name !== "string" || !salon.name.trim()) {
      return { status: "unreachable" };
    }

    return { status: "ok", salon };
  } catch {
    /* Délai dépassé, DNS, connexion refusée : aucun détail utile à l'écran. */
    return { status: "unreachable" };
  }
});
