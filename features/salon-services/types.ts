/**
 * Prestation du catalogue du salon — `SalonServiceEntity`.
 *
 * `id` : même convention que les autres entités (absent du schéma déclaré,
 * présent en réel — vérifié sur `/public/{slug}/services`).
 * `price` : déclaré `number`, sérialisé en chaîne décimale par l'API mesurée.
 */
export interface SalonServiceItem {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly durationMinutes: number;
  readonly price: number | string;
  readonly imageUrl?: string;
  readonly active: boolean;
  readonly bookableOnline: boolean;
}

export interface SalonServiceFilters {
  readonly active?: boolean;
  readonly category?: string;
}

/**
 * Corps de `POST /salon-services` et `PATCH /salon-services/{id}`.
 *
 * `durationMinutes` et `price` sont des nombres côté serveur : le formulaire
 * convertit les champs texte une seule fois, à l'envoi, et refuse une valeur non
 * numérique plutôt que d'envoyer `NaN`.
 */
export interface SalonServiceInput {
  readonly name: string;
  readonly durationMinutes: number;
  readonly price: number;
  readonly description?: string;
  readonly category?: string;
  readonly active?: boolean;
  readonly bookableOnline?: boolean;
}
