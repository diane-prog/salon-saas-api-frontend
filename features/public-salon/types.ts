/**
 * Types de la **vitrine publique d'un salon** — les seuls endpoints de l'API
 * accessibles sans jeton, donc les seuls que la landing peut consommer.
 *
 * Tous les champs sont relevés sur l'API réelle (appel `curl` du 2026-10-16 sur
 * `studio-kayao`), pas déduits du Swagger : celui-ci annonce `any` pour `info`
 * et `reviews`, et c'est précisément là que se trouvent les données qui
 * intéressent la landing — les couleurs du salon et la note moyenne.
 */

/** Couleurs de marque du salon, injectées en variables CSS sur sa vitrine. */
export interface SalonColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
}

export interface SalonSocial {
  readonly facebook: string | null;
  readonly instagram: string | null;
  readonly website: string | null;
  readonly whatsapp: string | null;
}

/** `GET /public/{slug}/info` — l'identité publique du salon. */
export interface SalonInfo {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logo: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly timezone: string;
  readonly description: string | null;
  readonly colors: SalonColors;
  readonly social: SalonSocial;
  /** Le salon accepte-t-il la réservation en ligne ? */
  readonly publicBooking: boolean;
}

/** `GET /tenants/by-slug/{slug}` — la même identité, sans les réglages de réservation. */
export interface SalonSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logo: string | null;
  readonly description: string | null;
  readonly colors: SalonColors;
  readonly city: string | null;
  readonly country: string | null;
}

/** `GET /public/{slug}/services` — prestation du catalogue public. */
export interface SalonService {
  /*
   * ⚠️ `id` n'est pas déclaré par le schéma Swagger de `SalonServiceEntity`, alors
   * que `POST /public/{slug}/booking` exige `serviceId` : l'entité le porte donc en
   * pratique (comme toutes les entités adressables de l'API). Il est déclaré
   * **optionnel** ici plutôt qu'inventé : la vitrine ne propose à la réservation que
   * les prestations qui en portent un, et le dit si aucune n'en a. Inventer un
   * identifiant produirait une réservation impossible.
   */
  readonly id?: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly durationMinutes: number;
  /**
   * Relevé le 2026-10-17 sur le salon de démonstration : `"90.00"`, une CHAÎNE —
   * alors que le Swagger déclare un nombre. Les deux formes sont donc possibles
   * selon la version du backend ; `formatPrice` les rend toutes deux lisibles.
   */
  readonly price: number | string;
  readonly imageUrl?: string;
  readonly active: boolean;
  readonly bookableOnline: boolean;
}

/** `GET /public/{slug}/staff` — membre de l'équipe présenté au public. */
export interface SalonStaffMember {
  /* Même remarque que `SalonService.id` : requis par `/booking`, absent du schéma. */
  readonly id?: string;
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
  /** Attention : renvoyé en **chaîne** (« 40.00 ») par ce chemin. */
  readonly commissionRate?: number | string;
  readonly active: boolean;
  readonly hireDate?: string;
}

/** `GET /public/{slug}/gallery` — image de la galerie (hébergée sur Cloudinary). */
export interface SalonGalleryImage {
  readonly tenantId: string;
  readonly publicId: string;
  readonly url: string;
  readonly secureUrl: string;
  readonly format: string;
  readonly width?: number;
  readonly height?: number;
  readonly bytes: number;
  readonly folder: string;
  readonly caption?: string;
  readonly tags?: string[];
  readonly staffId?: string;
  readonly serviceId?: string;
}

/** Avis approuvé, tel qu'affiché sur la vitrine. */
export interface SalonReview {
  readonly id: string;
  readonly tenantId: string;
  readonly customerId: string | null;
  readonly customerName: string;
  readonly staffId: string | null;
  readonly serviceId: string | null;
  readonly rating: number;
  readonly comment: string | null;
  readonly approved: boolean;
  readonly source: "PUBLIC" | "INTERNAL";
  readonly updatedAt?: string;
}

/** `POST /public/{slug}/reviews` — dépôt d'un avis (modéré avant publication). */
export interface CreateReviewDto {
  readonly rating: number;
  readonly comment?: string;
  readonly staffId?: string;
  readonly serviceId?: string;
  readonly appointmentId?: string;
  readonly customerName?: string;
}

/**
 * `POST /public/{slug}/slots` — créneau proposé par le moteur de disponibilité.
 *
 * `startTime` / `endTime` sont des heures **locales au salon**, au format `HH:mm`
 * (le fuseau est donné par `info.timezone`) : ce ne sont pas des instants ISO, et
 * il ne faut donc pas les passer à `new Date()` — on les affiche tels quels.
 */
export interface TimeSlot {
  readonly startTime: string;
  readonly endTime: string;
  readonly available: boolean;
}

/**
 * `POST /public/{slug}/booking` — réservation sans compte.
 *
 * Champs obligatoires relevés sur le Swagger (`PublicBookingDto`) : prénom, nom,
 * téléphone, prestation, membre de l'équipe, date et heure. Le backend crée la
 * fiche client tout seul si le téléphone est inconnu, et le rendez-vous part en
 * statut `PENDING`.
 */
export interface PublicBookingDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email?: string;
  readonly serviceId: string;
  readonly staffId: string;
  /** Date ISO (`2026-01-20T00:00:00.000Z`) : le jour réservé. */
  readonly date: string;
  /** Heure locale du salon, `HH:mm`. */
  readonly startTime: string;
  readonly notes?: string;
}

/** Rendez-vous rendu par `POST /public/{slug}/booking` (extrait utile à la vitrine). */
export interface PublicBooking {
  readonly id: string;
  readonly status?: string;
  readonly date?: string;
  readonly startTime?: string;
  readonly endTime?: string;
}

/** `POST /public/{slug}/contact` — message envoyé au salon depuis sa vitrine. */
export interface ContactSalonDto {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly subject?: string;
  readonly message: string;
}

/* ------------------------------- enveloppes ------------------------------- */

export interface SalonInfoResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonInfo;
}

export interface SalonSummaryResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonSummary;
}

export interface SalonServicesResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonService[];
}

export interface SalonStaffResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonStaffMember[];
}

export interface SalonGalleryResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonGalleryImage[];
}

/**
 * `GET /public/{slug}/reviews` ne rend **pas** un tableau : `data` est un objet
 * `{ reviews, averageRating }`. Le Swagger l'annonce `any` — c'est ce qu'on
 * obtient réellement.
 */
export interface SalonReviewsResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly reviews: SalonReview[];
    readonly averageRating: number;
  };
}

export interface SalonContactResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: {
    readonly tenantId: string;
    readonly name: string;
    readonly email: string;
    readonly phone?: string;
    readonly subject?: string;
    readonly message: string;
    readonly read: boolean;
    readonly repliedAt?: string;
  };
}

export interface SalonReviewCreatedResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: SalonReview;
}

/**
 * `POST /public/{slug}/slots` — **le Swagger annonce un tableau nu**, alors que
 * les autres routes publiques enveloppent dans `{ success, statusCode, data }`.
 * Le client accepte les deux formes (voir `getSalonSlots`) ; ce type décrit la
 * forme enveloppée, celle des autres lectures.
 */
export interface SalonSlotsResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: TimeSlot[];
}

/** `POST /public/{slug}/booking` — même incertitude d'enveloppe, même réponse. */
export interface SalonBookingResponse {
  readonly success?: boolean;
  readonly statusCode: number;
  readonly data: PublicBooking;
}
