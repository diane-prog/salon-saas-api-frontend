/**
 * Compte d'accès au salon — forme relevée sur `GET /users` (le schéma
 * `PublicUserEntity` du Swagger est vide).
 *
 * `role` est celui du backend : OWNER, ADMIN, MANAGER, STAFF (SUPER_ADMIN vit
 * hors tenant). `lastLoginAt` peut être nul : un compte créé et jamais utilisé.
 */
export type AccountRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "SUPER_ADMIN";

/**
 * Corps de `POST /users` — `CreateUserDto`.
 *
 * Le mot de passe est **obligatoire à la création** (8 caractères au moins au
 * contrat) et transmis au serveur : il n'y a pas d'invitation par e-mail dans
 * cette API. Le rôle est obligatoire aussi, et `SUPER_ADMIN` en est exclu — un
 * compte de plateforme ne se crée pas depuis un salon.
 */
export interface AccountInput {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly role: Exclude<AccountRole, "SUPER_ADMIN">;
  readonly avatar?: string;
}

/**
 * Corps de `PATCH /users/{id}` — `UpdateUserDto`.
 *
 * `password` y est facultatif : le renseigner **remplace** le mot de passe du
 * compte (c'est la seule façon de le réinitialiser depuis cette API).
 */
export interface AccountUpdate {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly role?: Exclude<AccountRole, "SUPER_ADMIN">;
  readonly avatar?: string;
  readonly active?: boolean;
  readonly password?: string;
}

export interface Account {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string | null;
  readonly role: AccountRole;
  readonly avatar?: string | null;
  readonly active: boolean;
  readonly lastLoginAt?: string | null;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
