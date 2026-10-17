/**
 * Notification — `NotificationEntity`.
 *
 * Le contrat donne le statut (`PENDING`, `SENT`, `FAILED`, `READ`) et le canal
 * (`EMAIL`, `SMS`, `PUSH`, `IN_APP`). Les deux routes de lecture existent :
 * `/notifications` (toutes celles du salon) et `/notifications/me` (les miennes).
 * L'écran utilise `/notifications/me`, chacune étant adressée à une personne.
 */
export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";

export interface Notification {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string | null;
  readonly customerId?: string | null;
  readonly channel: NotificationChannel;
  readonly type: string;
  readonly subject?: string | null;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly sentAt?: string | null;
  readonly readAt?: string | null;
  readonly createdAt?: string;
  readonly metadata?: Record<string, unknown> | null;
}
