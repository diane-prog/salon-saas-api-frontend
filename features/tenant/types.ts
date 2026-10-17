/**
 * Le salon (tenant) — formes RELEVÉES sur l'API, pas déduites du Swagger.
 *
 * Trois lectures distinctes, et c'est le contrat qui les sépare :
 *   - `/tenant/me`      : l'identité (nom, slug, contacts, fuseau, forfait) ;
 *   - `/tenant/settings`: l'apparence et les réseaux (couleurs, logo, socials) ;
 *   - `/tenant/stats`   : les compteurs d'usage (membres, clientes, photos…).
 *
 * Le schéma Swagger de `/tenant/me` n'annonce pas `id` ; la réponse réelle le
 * porte (vérifié le 2026-10-17). Les champs nullables le sont vraiment (logo,
 * adresse, ville, pays) : l'écran les traite comme tels.
 */
export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logo?: string | null;
  readonly phone?: string | null;
  readonly email: string;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly country?: string | null;
  readonly timezone: string;
  readonly subscriptionPlan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  readonly active: boolean;
  readonly updatedAt?: string;
}

/**
 * Corps de `PATCH /tenant/me` — `UpdateTenantDto`.
 *
 * `plan` et `active` existent au contrat mais ne sont pas ici : changer de
 * forfait ou suspendre un salon n'est pas un réglage de salon, c'est une
 * décision de la plateforme. Les exposer ici laisserait croire le contraire.
 */
export interface TenantIdentityInput {
  readonly name?: string;
  readonly slug?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly city?: string;
  readonly country?: string;
  readonly timezone?: string;
}

/** Corps de `PATCH /tenant/settings` — `UpdateTenantSettingDto`. */
export interface TenantAppearanceInput {
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly accentColor?: string;
  readonly logo?: string;
  readonly favicon?: string;
  readonly heroImage?: string;
  readonly description?: string;
  readonly facebook?: string;
  readonly instagram?: string;
  readonly tiktok?: string;
  readonly twitter?: string;
  readonly website?: string;
  readonly whatsapp?: string;
}

export interface TenantSettings {
  readonly id: string;
  readonly tenantId: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor?: string | null;
  readonly logo?: string | null;
  readonly favicon?: string | null;
  readonly heroImage?: string | null;
  readonly description?: string | null;
  readonly facebook?: string | null;
  readonly instagram?: string | null;
  readonly tiktok?: string | null;
  readonly twitter?: string | null;
  readonly website?: string | null;
  readonly whatsapp?: string | null;
}

export interface TenantStats {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly plan: Tenant["subscriptionPlan"];
  readonly active: boolean;
  readonly counts: {
    readonly users: number;
    readonly customers: number;
    readonly staff: number;
    readonly services: number;
    readonly appointments: number;
    readonly gallery: number;
  };
}
