/**
 * Déballe une réponse de l'API quand elle est enveloppée.
 *
 * MESURÉ, et c'est toute la raison d'être : les contrôleurs rendent
 * `{ success, statusCode, data }` (vu sur `/public/{slug}/info`, `/reviews`,
 * `/slots`…), alors que le Swagger décrit souvent un tableau nu ou l'entité
 * seule. Une seule forme est manipulée dans le code, jamais deux.
 *
 * Un tableau n'est jamais enveloppé par erreur dans ce projet : la vérification
 * `!Array.isArray` évite de confondre une liste avec un objet qui porterait un
 * champ `data`.
 */
export function apiPayload<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}
