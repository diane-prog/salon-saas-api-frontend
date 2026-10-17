/**
 * Messages de retour d'action, dans la langue de la page.
 *
 * POURQUOI CE FICHIER : le retour d'action est centralisé dans React Query (voir
 * `lib/query-client.ts`) pour qu'aucune écriture ne puisse l'oublier — le
 * contraire obligerait à répéter un appel de notification dans chaque feuille,
 * et la première qui l'oublierait laisserait l'utilisateur sans confirmation.
 *
 * Or React Query vit HORS de l'arbre React : il n'a pas accès au dictionnaire
 * fourni par le layout. Le `DictionaryProvider` dépose donc ici les quatre
 * phrases de la langue courante, et le client les relit au moment où une
 * mutation se termine. Sans provider (rendu serveur, test), les phrases
 * françaises par défaut prennent le relais : jamais un `undefined` à l'écran.
 */
export type FeedbackMessages = {
  readonly success: string;
  readonly error: string;
};

const FALLBACK: FeedbackMessages = {
  success: "C'est enregistré.",
  error: "L'enregistrement n'a pas abouti. Réessayez dans un instant.",
};

let current: FeedbackMessages = FALLBACK;

export function setFeedbackMessages(messages: FeedbackMessages) {
  current = messages;
}

export function feedbackMessages(): FeedbackMessages {
  return current;
}
