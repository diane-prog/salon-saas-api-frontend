import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { Review, ReviewFilters, ReviewInput, ReviewStats } from "./types";

/** `GET /reviews` — filtrable par état d'approbation et par membre de l'équipe. */
export const getReviews = async (filters: ReviewFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );

  const { data } = await api.get<unknown>("/reviews", { params });
  return apiPayload<Review[]>(data);
};

/** `GET /reviews/stats` — total, publiés, en attente, moyenne, répartition. */
export const getReviewStats = async () => {
  const { data } = await api.get<unknown>("/reviews/stats");
  return apiPayload<ReviewStats>(data);
};

/**
 * `POST /reviews` — saisir un avis reçu au comptoir.
 *
 * Distinct de `POST /public/{slug}/reviews` : celui-ci passe par la session du
 * salon, donc l'auteur est identifié et l'avis porte la source `INTERNAL`. Il
 * arrive non approuvé, comme un avis de vitrine.
 */
export const createReview = async (dto: ReviewInput) => {
  const { data } = await api.post<unknown>("/reviews", dto);
  return apiPayload<Review>(data);
};

/**
 * `PATCH /reviews/{id}/approve` — publie l'avis sur la vitrine.
 *
 * Aucun corps : la route est un interrupteur d'état, pas un formulaire. Elle est
 * réversible (l'avis reste modifiable côté serveur), mais l'écran ne propose pas
 * de « désapprouver » : la route correspondante n'existe pas dans le contrat.
 */
export const approveReview = async (id: string) => {
  const { data } = await api.patch<unknown>(`/reviews/${id}/approve`);
  return apiPayload<Review>(data);
};

/**
 * `DELETE /reviews/{id}` — suppression définitive.
 *
 * Contrairement à la publication, cette route n'est pas réversible : l'avis
 * quitte la vitrine et la moyenne du salon est recalculée par le serveur.
 * L'écran demande donc confirmation avant l'appel.
 */
export const deleteReview = async (id: string) => {
  await api.delete<unknown>(`/reviews/${id}`);
  return id;
};
