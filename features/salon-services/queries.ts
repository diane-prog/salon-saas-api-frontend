import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createSalonServiceItem,
  deleteSalonServiceItem,
  getSalonServiceCategories,
  getSalonServiceItem,
  getSalonServiceItems,
  updateSalonServiceItem,
} from "./api";
import type {
  SalonServiceFilters,
  SalonServiceInput,
  SalonServiceItem,
} from "./types";

/** Catalogue du salon. Même clé que le reste du domaine `salonServices`. */
export const useSalonServiceItems = (filters: SalonServiceFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.salonServices.list(filters),
    queryFn: () => getSalonServiceItems(filters),
  });
};

export const useCreateSalonServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SalonServiceInput) => createSalonServiceItem(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salonServices.all });
    },
  });
};

export const useUpdateSalonServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Partial<SalonServiceInput> & { id: string }) =>
      updateSalonServiceItem(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salonServices.all });
    },
  });
};

/** Une prestation par son identifiant, pour rouvrir sa fiche à jour. */
export const useSalonServiceItem = (id: string | null, initialData?: SalonServiceItem) => {
  return useQuery({
    queryKey: queryKeys.salonServices.detail(id ?? ""),
    queryFn: () => getSalonServiceItem(id as string),
    enabled: Boolean(id),
    initialData,
  });
};

/**
 * Les catégories connues du catalogue.
 *
 * Mises en cache longtemps (`staleTime`) : elles ne changent qu'à la création
 * d'une nouvelle rubrique, et le formulaire les propose à chaque ouverture.
 */
export const useSalonServiceCategories = () => {
  return useQuery({
    queryKey: queryKeys.salonServices.categories(),
    queryFn: getSalonServiceCategories,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Supprimer une prestation invalide le catalogue, les catégories (une rubrique
 * peut disparaître avec sa dernière prestation) et les rendez-vous, qui la
 * nomment.
 */
export const useDeleteSalonServiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSalonServiceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salonServices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};
