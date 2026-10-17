/**
 * La famille d'une action du journal — la seule chose que l'écran DÉDUIT.
 *
 * POURQUOI CE FICHIER EXISTE : tout le reste du journal vient de `GET /audit/logs` (action,
 * entité, auteur, IP, agent). La famille, non : le contrat n'a pas ce champ. L'écran la
 * déduit donc du texte de `action` pour colorer un nœud et afficher un mot lisible — et cette
 * déduction mérite d'être écrite une fois, nommée, et vérifiable hors de React.
 *
 * RÈGLE : l'action brute reste TOUJOURS affichée à côté du libellé de famille. La famille est
 * une lecture de confort ; si elle se trompe, le texte fait foi.
 *
 * L'ORDRE DES TESTS COMPTE. « LOGOUT » contient « LOG » ; « DELETE_APPOINTMENT » contient
 * « APPOINTMENT » mais aussi « DELETE » ; « RESET_PASSWORD » contient « SET » (qui est un
 * verbe de modification) alors que c'est un changement de session. On teste donc du plus
 * spécifique au plus général, et **ce qui n'est pas reconnu tombe dans « other »** : un point
 * gris vaut mieux qu'un point vert mensonger.
 */

export type AuditFamily = "create" | "update" | "delete" | "session" | "other";

/** Verbes de session : ouvrir, fermer, vérifier, rafraîchir un accès. */
const SESSION = /LOG|SIGN|AUTH|TOKEN|SESSION|RESET_PASSWORD|OTP|VERIF/;

/** Verbes d'effacement. */
const DELETE = /DELETE|REMOVE|PURGE|CANCEL|REVOKE|DESTROY/;

/** Verbes de création. */
const CREATE = /CREATE|ADD|INSERT|REGISTER|MAKE|IMPORT|UPLOAD/;

/** Verbes de modification. */
const UPDATE = /UPDATE|EDIT|PATCH|MODIFY|CHANGE|RESTORE|ASSIGN|SET|MOVE|SCHEDULE|CONFIRM/;

export function familyOf(action: string): AuditFamily {
  const value = action.toUpperCase();

  if (SESSION.test(value)) return "session";
  if (DELETE.test(value)) return "delete";
  if (CREATE.test(value)) return "create";
  if (UPDATE.test(value)) return "update";
  return "other";
}
