import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { deleteGalleryImage, getGalleryImages, uploadGalleryImage } from "./api";

/** Galerie du salon. Même domaine de clés que la vitrine (`gallery`). */
export const useGalleryImages = () => {
  return useQuery({
    queryKey: queryKeys.gallery.list({}),
    queryFn: () => getGalleryImages(),
  });
};

/**
 * Envoi d'une image.
 *
 * Le domaine entier est invalidé, pas seulement la liste du salon : la vitrine
 * publique lit la même galerie sous une autre clé (`publicSalon.galleryList`).
 * Une photo qui apparaît dans l'espace mais pas sur la page publique serait un
 * cache périmé, pas une fonctionnalité.
 *
 * Les compteurs du salon (`/tenant/stats`) comptent aussi les photos : ils sont
 * rafraîchis au passage, sinon la vignette « photos » mentirait jusqu'au
 * rechargement.
 */
export const useUploadGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};
