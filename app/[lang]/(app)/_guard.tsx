"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Garde de l'espace salon.
 *
 * Elle lit le jeton dans `localStorage` — c'est là qu'il vit, par contrat (voir
 * `lib/axios-config.ts`) — et renvoie à la connexion s'il est absent.
 *
 * POURQUOI UNE GARDE CLIENT, ET CE QU'ELLE NE PROTÈGE PAS : le jeton est détenu
 * par le navigateur, donc la seule chose qu'on puisse faire ici est d'éviter
 * d'afficher un écran vide à quelqu'un qui n'est pas connecté. Ce n'est pas une
 * frontière de sécurité — la vraie porte est côté API, qui refuse toute requête
 * sans jeton valide. Un utilisateur qui forcerait l'affichage de l'écran ne
 * verrait que des requêtes en 401.
 *
 * Trois états, pour ne jamais clignoter : `undefined` = on ne sait pas encore
 * (rien n'est rendu), `null` = pas de jeton (redirection), une chaîne = on rend.
 * Sans ce premier état, l'écran s'afficherait une frame avant la redirection.
 *
 * Le jeton est lu via `useSyncExternalStore`, et non recopié dans un état par un
 * effet : c'est une valeur du navigateur, pas un état du composant. Bonus, les
 * événements écoutés (`storage` d'un autre onglet, `auth:unauthorized` émis par
 * le client HTTP sur un 401) rafraîchissent la lecture sans code de synchronisation.
 */
const TOKEN_KEY = "ACCESS_TOKEN";

/** Abonnement aux changements du jeton : autre onglet, ou session révoquée. */
function subscribeToToken(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("auth:unauthorized", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("auth:unauthorized", onChange);
  };
}

const readToken = () => window.localStorage.getItem(TOKEN_KEY);

/** Rendu serveur : aucun jeton lisible, donc « on ne sait pas encore ». */
const readTokenOnServer = () => undefined;

export default function WorkspaceGuard({ children }: { readonly children: ReactNode }) {
  const { locale } = useDictionary();
  const router = useRouter();
  const token = useSyncExternalStore(subscribeToToken, readToken, readTokenOnServer);

  useEffect(() => {
    if (token === null) router.replace(`/${locale}/login`);
  }, [token, router, locale]);

  if (token === undefined || token === null) {
    return <div className="min-h-svh bg-paper" aria-busy="true" />;
  }

  return <>{children}</>;
}
