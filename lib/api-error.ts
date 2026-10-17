import type { AxiosError } from "axios";

/**
 * Lit le message d'erreur **réel** du backend, pour l'afficher.
 *
 * Ce n'est PAS une couche de normalisation d'erreurs : la logique de nos projets
 * de référence est conservée telle quelle (l'intercepteur de
 * `lib/axios-config.ts` laisse remonter l'erreur axios brute, et les mutations
 * décident quoi en faire). Cette fonction ne sert qu'à un endroit : choisir la
 * phrase à montrer à l'utilisateur.
 *
 * Pourquoi elle existe : le backend est hétérogène et bavard, et ses messages
 * sont utiles — « Invalid email or password », « Staff limit reached for your
 * plan (1) », « cet email a déjà été utilisé ». Les remplacer par un « une erreur
 * est survenue » générique, c'est jeter la seule information qui aide.
 *
 * L'enveloppe d'erreur réelle (mesurée) :
 *   `{ statusCode, path, method, timestamp, error }`
 * où `error` est une **chaîne**, ou un **tableau** de chaînes quand il s'agit de
 * la validation Joi (`["firstName must be longer than…"]`).
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ error?: string | string[]; message?: string | string[] }>;

  const body = axiosError?.response?.data;
  const raw = body?.error ?? body?.message;

  if (Array.isArray(raw)) {
    const messages = raw.filter((value) => typeof value === "string" && value.trim());
    return messages.length ? messages.join(" · ") : fallback;
  }

  if (typeof raw === "string" && raw.trim()) return raw;

  /* Erreur réseau : le serveur n'a jamais répondu. Cas fréquent en développement
     (API éteinte, variable d'environnement absente) et il mérite sa phrase. */
  if (axiosError?.code === "ERR_NETWORK") return fallback;

  return fallback;
}
