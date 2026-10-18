/**
 * Contrats de données de l'authentification — relevés **sur le Swagger**
 * (`docs/openapi.json`) puis **vérifiés sur l'API de développement**.
 *
 * L'enveloppe de l'API est la même partout :
 *   succès → `{ success, statusCode, data, timestamp, path }`
 *   erreur → `{ statusCode, path, method, timestamp, error }`
 *
 * Comme dans nos projets de référence, chaque feature porte sa propre interface
 * de réponse (`XResponse`) et `api.ts` rend le corps entier : l'appelant lit
 * `res.data`. Aucun déballage automatique n'est posé dans l'intercepteur — c'est
 * le contrat de la référence, et il garde `statusCode` lisible au point d'appel.
 */

/** Rôles du backend. `SUPER_ADMIN` vit hors tenant (accès `/platform/*`). */
export type Role = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "SUPER_ADMIN";

/** `POST /auth/login` — identifiants de l'écran d'accès. */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** `POST /auth/verify-otp` — code à 6 chiffres reçu par e-mail. */
export interface OtpCredentials {
  readonly email: string;
  readonly code: string;
}

/** `POST /auth/otp/resend` */
export interface ResendOtpCredentials {
  readonly email: string;
}

/**
 * `POST /auth/password/forgot` — demande d'un lien de réinitialisation.
 *
 * La route reste **à implémenter côté backend** : voir `docs/backend-password-reset.md`.
 */
export interface ForgotPasswordCredentials {
  readonly email: string;
}

/**
 * `POST /auth/password/reset` — le jeton vient du lien reçu par courriel, le mot de passe
 * est le nouveau. Le jeton est à usage unique : un second envoi du même formulaire échoue.
 */
export interface ResetPasswordCredentials {
  readonly token: string;
  readonly password: string;
}

/** `POST /auth/register` — crée le salon (tenant) **et** son compte propriétaire. */
export interface RegisterCredentials {
  readonly tenantName: string;
  readonly tenantSlug: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
}

/** Identité renvoyée par `GET /auth/me` (mesurée : pas de `permissions`). */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly role: Role;
  readonly tenantId: string;
  readonly isPlatformAdmin?: boolean;
}

/** Salon tel qu'il apparaît dans la réponse d'authentification. */
export interface AuthTenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logo?: string | null;
  readonly description?: string | null;
}

/**
 * `POST /auth/register` et `POST /auth/verify-otp` — **seul** endpoint qui rend
 * un jeton. `AuthResponseDto` ne contient **pas** de refresh token : le jeton
 * vaut 7 jours et il n'y a pas de renouvellement silencieux.
 */
export interface AuthResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly accessToken: string;
    readonly user: AuthUser;
    readonly tenant?: AuthTenant;
  };
}

/** `POST /auth/login` et `POST /auth/otp/resend` — le code part par e-mail. */
export interface OtpSentResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly message: string;
    readonly email: string;
    /** Durée de vie du code, en secondes (600 = 10 minutes). */
    readonly expiresIn: number;
  };
}

/**
 * `POST /auth/password/forgot` — même forme que `OtpSentResponse` : un message, l'adresse
 * concernée, et la durée de vie du lien en secondes (900 = 15 minutes).
 */
export interface PasswordResetRequestedResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly message: string;
    readonly email: string;
    readonly expiresIn: number;
  };
}

/** `POST /auth/password/reset` — accusé de réception ; la session n'est pas ouverte. */
export interface PasswordResetResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly message: string;
  };
}

/** `GET /auth/me` */
export interface MeResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: AuthUser;
}
