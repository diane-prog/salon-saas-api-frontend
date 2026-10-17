/**
 * Membre de l'équipe — `StaffEntity`.
 *
 * `id` : absent du schéma déclaré, présent en réel (vérifié sur
 * `/public/{slug}/staff`).
 * `commissionRate` : renvoyé en chaîne (`"40.00"`) par le chemin public, en
 * nombre ailleurs — le type accepte les deux.
 */
export interface StaffMember {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly title?: string;
  readonly bio?: string;
  readonly avatar?: string;
  readonly specialties?: string[];
  readonly commissionRate?: number | string;
  readonly active: boolean;
  readonly hireDate?: string;
}

/** Jour de la semaine au sens du backend : 0 = dimanche, 1 = lundi, …, 6 = samedi. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Un créneau hebdomadaire — `SetAvailabilityDto.slots[]`.
 *
 * `startTime` / `endTime` sont des heures locales au format `HH:mm`
 * (« 09:00 »), pas des dates : la disponibilité décrit une semaine type, pas
 * une semaine datée.
 */
export interface StaffAvailabilitySlot {
  readonly dayOfWeek: Weekday;
  readonly startTime: string;
  readonly endTime: string;
  readonly active: boolean;
}

/** `GET /staff/{id}/availability` — le créneau tel qu'il revient, avec son propriétaire. */
export interface StaffAvailability extends StaffAvailabilitySlot {
  readonly id?: string;
  readonly tenantId?: string;
  readonly staffId?: string;
}

/** Corps de `POST /staff` et `PATCH /staff/{id}` (champs du contrat). */
export interface StaffInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly title?: string;
  readonly bio?: string;
  readonly specialties?: string[];
  readonly commissionRate?: number;
  readonly active?: boolean;
}
