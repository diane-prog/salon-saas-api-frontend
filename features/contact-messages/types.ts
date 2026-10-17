/**
 * Message reçu depuis la vitrine d'un salon — `ContactMessageEntity`.
 *
 * `GET /contact-messages` accepte `?read=true|false` ; `PATCH /{id}/read` marque
 * un message comme lu. Rien dans le contrat ne permet de répondre depuis
 * l'application (pas d'envoi de réponse) : `repliedAt` est donc une information
 * venue d'ailleurs, pas une action de cet écran.
 */
export interface ContactMessage {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly subject?: string | null;
  readonly message: string;
  readonly read: boolean;
  readonly repliedAt?: string | null;
  readonly createdAt?: string;
}

export interface ContactMessageFilters {
  readonly read?: boolean;
}
