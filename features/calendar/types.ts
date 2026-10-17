/**
 * Calendrier du salon — deux lectures complémentaires.
 *
 *   - `GET /calendar/occupied` : les blocs DÉJÀ pris (heure, statut, rendez-vous) ;
 *   - `GET /calendar/slots`    : la grille calculée de la journée, avec pour chaque
 *     créneau un booléen `available`.
 *
 * Les heures sont locales au salon (`HH:mm`), jamais des instants ISO : on les
 * affiche telles quelles.
 */
export interface OccupiedSlot {
  readonly startTime: string;
  readonly endTime: string;
  readonly status: string;
  readonly appointmentId: string;
}

export interface FreeSlot {
  readonly startTime: string;
  readonly endTime: string;
  readonly available: boolean;
}

export interface CalendarParams {
  /** `YYYY-MM-DD`. */
  readonly date: string;
  readonly staffId?: string;
  readonly serviceId?: string;
}
