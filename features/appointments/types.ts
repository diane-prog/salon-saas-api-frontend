/**
 * Types des rendez-vous du salon — `appointments` dans `docs/openapi.json`.
 *
 * `id` n'est pas déclaré dans le schéma Swagger de `AppointmentEntity` (le même
 * oubli que pour les prestations et l'équipe), mais il est bien renvoyé par
 * l'API : sans lui, aucun rendez-vous ne serait identifiable à l'écran. Il est
 * donc requis ici.
 *
 * `price` est déclaré `number` côté serveur, mais sérialisé en **chaîne**
 * (`"90.00"`) sur le catalogue public mesuré : le type accepte les deux, et
 * l'affichage passe par `formatPrice`.
 */
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  readonly id: string;
  readonly tenantId: string;
  readonly customerId: string;
  readonly staffId: string;
  readonly serviceId: string;
  /** Jour du rendez-vous, ISO. */
  readonly date: string;
  /** Heure locale du salon, `HH:mm`. */
  readonly startTime: string;
  readonly endTime: string;
  readonly durationMinutes: number;
  readonly price: number | string;
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly isPublicBooking?: boolean;
  readonly cancelledReason?: string;
}

/**
 * Corps de `PATCH /appointments/{id}` — sous-ensemble accepté par le contrat.
 *
 * `CreateAppointmentDto` n'est volontairement pas réutilisé : créer exige la
 * prestation et le membre, modifier peut ne toucher QUE le statut. Mélanger les
 * deux types ferait croire qu'un changement de statut doit renvoyer tout l'objet.
 */
export interface AppointmentUpdate {
  readonly customerId?: string;
  readonly staffId?: string;
  readonly serviceId?: string;
  readonly date?: string;
  readonly startTime?: string;
  readonly notes?: string;
  readonly status?: AppointmentStatus;
  readonly cancelledReason?: string;
}

/**
 * Corps de `POST /appointments` — `CreateAppointmentDto`.
 *
 * Le contrat exige la cliente, le membre, la prestation, la date et l'heure :
 * durée, heure de fin et prix sont calculés par le serveur à partir de la
 * prestation. Les envoyer serait les contredire.
 *
 * `isPublicBooking` reste `false` ici : un rendez-vous saisi au comptoir n'est
 * pas une réservation en ligne, et la distinction sert au suivi d'origine.
 */
export interface AppointmentInput {
  readonly customerId: string;
  readonly staffId: string;
  readonly serviceId: string;
  /** Jour, au format ISO complet (`2026-01-20T00:00:00.000Z`). */
  readonly date: string;
  /** Heure locale du salon, `HH:mm`. */
  readonly startTime: string;
  readonly notes?: string;
}

/** Filtres de `GET /appointments` — tous facultatifs. */
export interface AppointmentFilters {
  /** Un seul jour, `YYYY-MM-DD`. */
  readonly date?: string;
  readonly from?: string;
  readonly to?: string;
  readonly staffId?: string;
  readonly customerId?: string;
  readonly status?: AppointmentStatus;
}
