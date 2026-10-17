import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  approveReview,
  createReview,
  deleteReview,
  getReviewStats,
  getReviews,
} from "./api";
import type { ReviewFilters, ReviewInput } from "./types";

export const useReviews = (filters: ReviewFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.reviews.list(filters),
    queryFn: () => getReviews(filters),
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: queryKeys.reviews.stats(),
    queryFn: getReviewStats,
  });
};

/**
 * Approuver un avis change DEUX choses à l'écran : la liste (l'avis passe de
 * « en attente » à « publié ») et la synthèse (le nombre en attente baisse). Le
 * domaine entier est donc invalidé, pas seulement la liste.
 */
export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
};

/**
 * Saisir un avis reçu au comptoir. Le domaine entier est invalidé : l'avis
 * apparaît dans « En attente », la synthèse change, et la vitrine publique lit
 * les mêmes avis approuvés.
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ReviewInput) => createReview(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
    },
  });
};

/**
 * Supprimer un avis retire aussi une note de la vitrine et de la moyenne : le
 * domaine des avis et la vitrine publique sont tous deux périmés.
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
    },
  });
};
