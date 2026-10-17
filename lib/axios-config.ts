import axios from "axios";

/**
 * Client HTTP de l'application — **même logique que
 * `ldmgV/ldmgwebsiteft/lib/axios-config.ts`**, appliquée à l'API Salon SaaS.
 *
 * Trois choses, et rien d'autre :
 *   1. une instance unique, `baseURL` lue dans l'environnement ;
 *   2. à chaque requête, l'en-tête `Authorization` reçoit le jeton porté par
 *      `localStorage.ACCESS_TOKEN` — c'est le contrat de nos projets : le jeton
 *      vit dans le navigateur, le client le relit à chaque appel ;
 *   3. sur un `401`, on tente un rafraîchissement avant de propager l'erreur.
 *
 * ⚠️ CE CLIENT EST STRICTEMENT NAVIGATEUR : il lit `localStorage`, qui n'existe
 * pas sur le serveur. Toute lecture de données doit donc passer par un composant
 * client (`features/<domaine>/queries.ts`, marqués `"use client"`). Un appel depuis un
 * Server Component planterait — c'est le prix de ce contrat, et il est assumé.
 *
 * ⚠️ L'API Salon SaaS **n'émet pas de refresh token** : `AuthResponseDto` ne
 * contient que `accessToken` (durée 7 jours). Le bloc de rafraîchissement est
 * donc inerte aujourd'hui — il reste en place parce que c'est la logique de
 * référence, et il se réveillera le jour où le backend exposera `/auth/refresh`.
 * Sans jeton de rafraîchissement, on purge la session au lieu de boucler.
 */
/**
 * Fin de session : purge le stockage ET prévient l'interface.
 *
 * L'événement compte autant que la purge — sans lui, la garde de l'espace salon
 * (`app/[lang]/(app)/_guard.tsx`) ne saurait pas que le jeton vient de mourir et
 * laisserait l'utilisateur devant des écrans qui échouent en boucle, au lieu de
 * le ramener à la connexion.
 */
function expireSession(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("ACCESS_TOKEN");
  window.localStorage.removeItem("REFRESH_TOKEN");
  window.dispatchEvent(new Event("auth:unauthorized"));
}

/**
 * Base réelle du client, selon le côté qui appelle.
 *
 * Côté SERVEUR : l'URL absolue de l'API, appel direct.
 * Côté NAVIGATEUR : `/api/backend`, notre propre route handler (voir
 * `app/api/backend/[...path]/route.ts`).
 *
 * POURQUOI cette bifurcation, et pas l'URL absolue des deux côtés comme dans la
 * référence : **le backend n'autorise aucune origine**. Mesuré le 2026-10-16 :
 * `Access-Control-Allow-Origin` est absent des réponses, en GET comme sur le
 * preflight (`OPTIONS`), pour `http://localhost:3000` comme pour n'importe quelle
 * autre origine — le serveur renvoie `access-control-allow-credentials: true` et
 * `vary: Origin`, mais n'écho jamais l'origine. Un appel direct du navigateur est
 * donc bloqué par la politique CORS, et axios le remonte en « Network Error »
 * sans réponse lisible.
 *
 * En passant par `/api/backend`, la requête devient same-origin : plus de
 * preflight, plus de blocage, et le jeton transite par notre propre domaine.
 * Le reste de la logique de la référence est intact — intercepteurs, jeton dans
 * `localStorage`, features, hooks, clés de requête. Le jour où le backend
 * ajoutera notre origine à sa liste CORS, il suffira de remplacer cette
 * constante par `API_BASE_URL` et de supprimer la route proxy.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_CLIENT_BASE_URL =
  typeof window === "undefined" ? API_BASE_URL : "/api/backend";

const api = axios.create({
  baseURL: API_CLIENT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = "Bearer " + localStorage.getItem("ACCESS_TOKEN");
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Token has expired. need to refreshing token...");
      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN");

        /* Pas de refresh token : inutile d'appeler un endpoint qui n'existe pas.
           On purge la session, ce qui ramène l'utilisateur à l'écran d'accès. */
        if (!refreshToken) {
          expireSession();
          throw new Error("No refresh token available");
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh?refresh_token=${refreshToken.replace(
            "Bearer ",
            "",
          )}`,
        );
      } catch {
        console.error("Failed to refresh token");
        expireSession();
      }
    }

    throw error;
  },
);

export default api;
