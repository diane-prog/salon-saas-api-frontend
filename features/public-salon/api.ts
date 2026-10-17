import api from "@/lib/axios-config";
import type {
  ContactSalonDto,
  CreateReviewDto,
  PublicBooking,
  PublicBookingDto,
  SalonContactResponse,
  SalonGalleryResponse,
  SalonInfoResponse,
  SalonReviewCreatedResponse,
  SalonReviewsResponse,
  SalonServicesResponse,
  SalonStaffResponse,
  SalonSummaryResponse,
  TimeSlot,
} from "./types";

/**
 * Endpoints **publics** d'un salon — aucun jeton requis, donc les seuls que la
 * landing peut appeler avant connexion.
 *
 * Même forme que les autres features : une fonction par endpoint, une ligne par
 * fonction, et le corps de la réponse rendu tel quel (`res.data` côté appelant).
 *
 * À quoi ça sert sur la landing : `getSalonInfo` rend les **couleurs de marque du
 * salon** (`colors`) et son `publicBooking`. C'est ce qui permet de montrer, sur
 * la page marketing, une vitrine qui n'est pas la nôtre mais celle du visiteur.
 */

export const getSalonInfo = async (slug: string) => {
  const { data } = await api.get<SalonInfoResponse>(`/public/${slug}/info`);
  return data;
};

export const getSalonBySlug = async (slug: string) => {
  const { data } = await api.get<SalonSummaryResponse>(`/tenants/by-slug/${slug}`);
  return data;
};

export const getSalonServices = async (slug: string) => {
  const { data } = await api.get<SalonServicesResponse>(`/public/${slug}/services`);
  return data;
};

export const getSalonStaff = async (slug: string) => {
  const { data } = await api.get<SalonStaffResponse>(`/public/${slug}/staff`);
  return data;
};

export const getSalonGallery = async (slug: string) => {
  const { data } = await api.get<SalonGalleryResponse>(`/public/${slug}/gallery`);
  return data;
};

export const getSalonReviews = async (slug: string) => {
  const { data } = await api.get<SalonReviewsResponse>(`/public/${slug}/reviews`);
  return data;
};

/**
 * Déballe `{ success, statusCode, data }` si la réponse est enveloppée, et rend
 * la charge telle quelle sinon.
 *
 * Pourquoi : les routes publiques mesurées (`info`, `services`, `reviews`…)
 * enveloppent leur charge, mais le Swagger décrit `POST /slots` comme renvoyant
 * un **tableau nu** et `POST /booking` comme renvoyant l'entité nue. Une vitrine
 * qui casserait selon la forme choisie par le contrôleur serait fragile pour
 * rien : les deux formes sont acceptées, une seule est manipulée.
 */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** Créneaux libres d'une journée — `POST`, donc jamais mis en cache par un intermédiaire. */
export const getSalonSlots = async ({
  slug,
  date,
  serviceId,
  staffId,
}: {
  slug: string;
  date: string;
  serviceId?: string;
  staffId?: string;
}) => {
  const { data } = await api.post<TimeSlot[]>(
    `/public/${slug}/slots`,
    // Champs vides omis : le backend attend `null` ou l'absence, pas `""`.
    {
      date,
      ...(serviceId ? { serviceId } : {}),
      ...(staffId ? { staffId } : {}),
    },
  );
  return unwrap<TimeSlot[]>(data);
};

/**
 * Réservation sans compte. Le client est créé par le backend si son téléphone
 * est inconnu ; le rendez-vous revient en statut `PENDING`.
 */
export const createSalonBooking = async ({ slug, ...dto }: PublicBookingDto & { slug: string }) => {
  const { data } = await api.post<PublicBooking>(`/public/${slug}/booking`, dto);
  return unwrap<PublicBooking>(data);
};

export const sendSalonContact = async ({ slug, ...dto }: ContactSalonDto & { slug: string }) => {
  const { data } = await api.post<SalonContactResponse>(`/public/${slug}/contact`, dto);
  return data;
};

/** L'avis part en modération : il n'apparaît sur la vitrine qu'après approbation. */
export const createSalonReview = async ({ slug, ...dto }: CreateReviewDto & { slug: string }) => {
  const { data } = await api.post<SalonReviewCreatedResponse>(`/public/${slug}/reviews`, dto);
  return data;
};
