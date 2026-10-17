import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { SalonServiceFilters, SalonServiceInput, SalonServiceItem } from "./types";

/**
 * `GET /salon-services` — catalogue du salon connecté.
 *
 * `active` est un booléen : il ne faut donc pas filtrer les valeurs « vides » avec
 * `!value`, sinon `false` (les prestations désactivées, justement) disparaîtrait
 * de la requête. On ne retire que `undefined` et la chaîne vide.
 */
export const getSalonServiceItems = async (filters: SalonServiceFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );

  const { data } = await api.get<unknown>("/salon-services", { params });
  return apiPayload<SalonServiceItem[]>(data);
};

/**
 * `GET /salon-services/{id}` — une prestation précise.
 *
 * La liste du catalogue porte déjà tout ; cette lecture sert à rouvrir le
 * formulaire sur l'état courant avant d'écrire.
 */
export const getSalonServiceItem = async (id: string) => {
  const { data } = await api.get<unknown>(`/salon-services/${id}`);
  return apiPayload<SalonServiceItem>(data);
};

/**
 * `GET /salon-services/categories` — les catégories déjà employées.
 *
 * Sert de suggestion dans le formulaire : une catégorie écrite à la main deux
 * fois de deux façons différentes crée deux rubriques dans la vitrine.
 */
export const getSalonServiceCategories = async () => {
  const { data } = await api.get<unknown>("/salon-services/categories");
  return apiPayload<string[]>(data);
};

/**
 * `DELETE /salon-services/{id}` — retire la prestation du catalogue.
 *
 * Les rendez-vous passés la référencent encore : l'écran les affichera
 * « prestation supprimée » plutôt que d'inventer un nom.
 */
export const deleteSalonServiceItem = async (id: string) => {
  await api.delete<unknown>(`/salon-services/${id}`);
  return id;
};

/** `POST /salon-services` — ajoute une prestation au catalogue. */
export const createSalonServiceItem = async (dto: SalonServiceInput) => {
  const { data } = await api.post<unknown>("/salon-services", dto);
  return apiPayload<SalonServiceItem>(data);
};

/** `PATCH /salon-services/{id}` — le contrat accepte un sous-ensemble. */
export const updateSalonServiceItem = async ({
  id,
  ...dto
}: Partial<SalonServiceInput> & { id: string }) => {
  const { data } = await api.patch<unknown>(`/salon-services/${id}`, dto);
  return apiPayload<SalonServiceItem>(data);
};
