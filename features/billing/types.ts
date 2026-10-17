/**
 * Abonnement du salon — `SubscriptionEntity`.
 *
 * `GET /subscriptions/plans` répond **401 sans jeton** (mesuré), et les prix
 * publics sont donc écrits dans les dictionnaires pour la page marketing. Ici,
 * dans l'espace authentifié, on lit l'abonnement RÉEL : forfait, état, dates et
 * montant. Aucun quota n'est recalculé — `PlanLimitsDto` n'est pas exposé par
 * `/subscriptions/current`.
 */
export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "TRIAL" | "EXPIRED";

/**
 * `GET /subscriptions/plans` — lisible AVEC un jeton (elle répond 401 sans).
 *
 * C'est la source des prix et des quotas du forfait : le salon connecté peut
 * donc voir ce que son forfait autorise, sans qu'on écrive ces chiffres en dur
 * dans l'espace. La page marketing, elle, reste statique — elle n'a pas de jeton.
 */
export interface PlanLimits {
  readonly maxCustomers: number;
  readonly maxStaff: number;
  readonly maxGalleryImages: number;
  readonly maxAppointmentsPerMonth: number;
  readonly smsNotifications: boolean;
  readonly advancedAnalytics: boolean;
  readonly customBranding: boolean;
  readonly publicBooking: boolean;
  readonly customDomain: boolean;
  readonly apiAccess: boolean;
}

export interface PlanInfo {
  readonly plan: Plan;
  readonly priceMonthly: number | string;
  readonly limits: PlanLimits;
}

/**
 * ⚠️ `GET /subscriptions/current` ne renvoie PAS l'abonnement complet :
 * la réponse réelle est `{ limits: {...} }` (mesuré le 2026-10-17), sans plan,
 * statut ni dates. Les dates et le statut vivent dans `/history`, le plan dans
 * `/tenant/me` — l'écran assemble les trois, il ne suppose rien.
 */
export interface SubscriptionCurrent {
  readonly limits?: Partial<PlanLimits>;
}

export interface Subscription {
  readonly id?: string;
  readonly tenantId: string;
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly trialEndDate?: string | null;
  readonly cancelAtPeriodEnd: boolean;
  /** Montant mensuel, tel que facturé (peut arriver en chaîne décimale). */
  readonly priceMonthly: number | string;
}
