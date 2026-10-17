import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createSalonBooking,
  createSalonReview,
  getSalonBySlug,
  getSalonGallery,
  getSalonInfo,
  getSalonReviews,
  getSalonServices,
  getSalonSlots,
  getSalonStaff,
  sendSalonContact,
} from "./api";
import type { ContactSalonDto, CreateReviewDto, PublicBookingDto } from "./types";

/**
 * Hooks de la vitrine publique — **même logique que les autres features** : un
 * `useQuery` par lecture, un `useMutation` par écriture, et des clés prises dans
 * `lib/query-key.ts` (`publicSalon.*`).
 *
 * Tous les hooks acceptent `enabled` pour qu'un composant puisse attendre de
 * connaître le slug avant de partir (sur la landing, il vient d'une variable
 * d'environnement et d'un sélecteur). Un `slug` vide ne déclenche donc aucune
 * requête, plutôt qu'un appel sur `/public//info`.
 */

export const useSalonInfo = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.info(slug),
    queryFn: () => getSalonInfo(slug),
    enabled: !!slug,
  });
};

export const useSalonBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.bySlug(slug),
    queryFn: () => getSalonBySlug(slug),
    enabled: !!slug,
  });
};

export const useSalonServices = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.servicesList(slug),
    queryFn: () => getSalonServices(slug),
    enabled: !!slug,
  });
};

export const useSalonStaff = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.staffList(slug),
    queryFn: () => getSalonStaff(slug),
    enabled: !!slug,
  });
};

export const useSalonGallery = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.galleryList(slug),
    queryFn: () => getSalonGallery(slug),
    enabled: !!slug,
  });
};

export const useSalonReviews = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.reviewsList(slug),
    queryFn: () => getSalonReviews(slug),
    enabled: !!slug,
  });
};

/**
 * Créneaux d'une journée pour un service (et, s'il est connu, un membre de
 * l'équipe).
 *
 * C'est une lecture servie par un `POST` — le moteur de disponibilité a besoin
 * d'un corps — mais elle reste une requête : mise en cache par jour et par
 * service, donc revenir sur une date déjà consultée ne rappelle pas l'API. Le
 * cache reste court (30 s) parce qu'un créneau peut partir pendant qu'on le
 * regarde.
 */
export const useSalonSlots = (
  slug: string,
  params: { date: string; serviceId?: string; staffId?: string },
) => {
  return useQuery({
    queryKey: queryKeys.publicSalon.slots(slug, params),
    queryFn: () => getSalonSlots({ slug, ...params }),
    enabled: !!slug && !!params.date,
    staleTime: 30_000,
    /* Un échec ici est montré avec un bouton « réessayer » : inutile de marteler
       l'API trois fois avant d'afficher une phrase honnête. */
    retry: false,
  });
};

/**
 * Réservation publique. Au succès, **tous les créneaux du salon** sont
 * invalidés : celui qui vient d'être pris ne doit plus être proposé à la
 * personne suivante, y compris pour une autre prestation.
 */
export const useCreateSalonBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: PublicBookingDto & { slug: string }) => createSalonBooking(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.publicSalon.all, "slots"] });
    },
  });
};

export const useSendSalonContact = () => {
  return useMutation({
    mutationFn: (dto: ContactSalonDto & { slug: string }) => sendSalonContact(dto),
  });
};

export const useCreateSalonReview = () => {
  return useMutation({
    mutationFn: (dto: CreateReviewDto & { slug: string }) => createSalonReview(dto),
  });
};
