import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "./api";
import type { Customer, CustomerFilters, CustomerInput } from "./types";

/**
 * Liste des clients du salon. La recherche passe par le serveur (`search`) : on
 * ne rapatrie pas tout le fichier client pour filtrer dans le navigateur — un
 * salon de plusieurs centaines de fiches y perdrait son temps.
 */
export const useCustomers = (filters: CustomerFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => getCustomers(filters),
  });
};

/** Créer une fiche invalide TOUTES les listes (recherches comprises). */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CustomerInput) => createCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

/** Modifier une fiche : même invalidation, la ligne change dans toutes les vues. */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Partial<CustomerInput> & { id: string }) => updateCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

/**
 * Une fiche par son identifiant — pour rouvrir un formulaire sur des valeurs
 * fraîches. `initialData` est la ligne déjà à l'écran : pas d'attente visible,
 * puis correction si le serveur a mieux à dire.
 */
export const useCustomer = (id: string | null, initialData?: Customer) => {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? ""),
    queryFn: () => getCustomer(id as string),
    enabled: Boolean(id),
    initialData,
  });
};

/**
 * Supprimer une fiche invalide les listes **et** les rendez-vous : ceux de cette
 * personne perdent leur nom à l'affichage (« cliente inconnue »), ce qui n'est
 * vrai qu'après rechargement si on ne le dit pas à React Query.
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};
