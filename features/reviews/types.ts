/**
 * Avis d'un salon — `ReviewEntity`.
 *
 * Même convention que les autres entités : `id` n'est pas déclaré dans le schéma
 * mais est renvoyé par l'API, et nécessaire pour approuver un avis précis.
 *
 * Un avis déposé depuis la vitrine arrive **non approuvé** (`approved: false`) :
 * il n'apparaît publiquement qu'après `PATCH /reviews/{id}/approve`. C'est
 * pourquoi l'écran de modération affiche les deux états sans les mélanger.
 */
export interface Review {
  readonly id: string;
  readonly tenantId: string;
  readonly customerId?: string | null;
  readonly customerName?: string;
  readonly staffId?: string | null;
  readonly serviceId?: string | null;
  readonly appointmentId?: string | null;
  readonly rating: number;
  readonly comment?: string | null;
  readonly approved: boolean;
  readonly source: "PUBLIC" | "INTERNAL";
  readonly updatedAt?: string;
}

/** `GET /reviews/stats` — la synthèse affichée en tête de l'écran. */
export interface ReviewStats {
  readonly total: number;
  readonly approved: number;
  readonly pending: number;
  readonly averageRating: number;
  readonly distribution: { readonly star: number; readonly count: number }[];
}

/**
 * Corps de `POST /reviews` — `CreateReviewDto`, sur le chemin authentifié.
 *
 * Même objet que la vitrine, à une différence près : ici, c'est le salon qui
 * saisit l'avis (une cliente qui l'a donné au comptoir), et le nom est libre —
 * il n'y a pas de fiche client obligatoire. Seule la note est exigée.
 *
 * L'avis créé par cette route part **non approuvé** : il rejoint l'onglet « En
 * attente » et ne s'affiche publiquement qu'après publication.
 */
export interface ReviewInput {
  readonly rating: number;
  readonly comment?: string;
  readonly staffId?: string;
  readonly serviceId?: string;
  readonly appointmentId?: string;
  readonly customerName?: string;
}

export interface ReviewFilters {
  readonly approved?: boolean;
  readonly staffId?: string;
}
