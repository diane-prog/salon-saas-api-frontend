/**
 * Fiche client — `CustomerEntity` dans `docs/openapi.json`.
 *
 * Même remarque que pour les rendez-vous : `id` est absent du schéma déclaré
 * mais renvoyé par l'API, et indispensable pour distinguer deux homonymes.
 *
 * `totalSpent` est un montant ; l'API le sérialise comme elle sérialise les
 * prix (chaîne décimale). Le type accepte donc les deux formes.
 */
export type CustomerSource = "WALK_IN" | "ONLINE" | "REFERRAL" | "SOCIAL" | "OTHER";

export interface Customer {
  readonly id: string;
  readonly tenantId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly notes?: string;
  readonly tags?: string[];
  readonly birthday?: string;
  readonly totalVisits: number;
  readonly createdAt?: string;
  readonly totalSpent: number | string;
  readonly loyaltyPoints: number;
  readonly source?: CustomerSource;
}

export interface CustomerFilters {
  readonly search?: string;
  readonly tag?: string;
}

/**
 * Corps de `POST /customers` et de `PATCH /customers/{id}`.
 *
 * Les champs obligatoires sont ceux du contrat (`CreateCustomerDto`) : prénom,
 * nom, téléphone. Le reste est facultatif des deux côtés — `UpdateCustomerDto`
 * accepte n'importe quel sous-ensemble, d'où le même type avec `Partial` à
 * l'appel.
 */
export interface CustomerInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email?: string;
  readonly notes?: string;
  readonly tags?: string[];
  readonly birthday?: string;
  readonly source?: CustomerSource;
}
