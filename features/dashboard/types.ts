import type { Appointment } from "@/features/appointments/types";

/**
 * `GET /dashboard` — relevé sur l'API (le Swagger n'en donne aucun schéma).
 *
 * La réponse réelle porte trois choses :
 *   - `tenant`   : qui est le salon, et son forfait ;
 *   - `today`    : le résumé du jour (rendez-vous, en attente, terminés, recette) ;
 *   - `upcomingAppointments` / `recentAppointments` : les rendez-vous à venir et
 *      les derniers passés, dans la même forme que `/appointments`.
 *
 * `revenue` est un montant sérialisé par l'API : nombre ou chaîne décimale,
 * comme les prix — l'affichage passe par `formatPrice`.
 */
export interface DashboardOverview {
  readonly tenant: {
    readonly id: string;
    readonly name: string;
    readonly plan: string;
  };
  readonly today: {
    readonly appointments: number;
    readonly pending: number;
    readonly completed: number;
    readonly revenue: number | string;
  };
  readonly upcomingAppointments: Appointment[];
  readonly recentAppointments: Appointment[];
}
