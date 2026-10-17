import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  getTenant,
  getTenantSettings,
  getTenantStats,
  updateTenant,
  updateTenantSettings,
} from "./api";
import type { TenantAppearanceInput, TenantIdentityInput } from "./types";

export const useTenant = () => {
  return useQuery({
    queryKey: queryKeys.tenant.me(),
    queryFn: getTenant,
  });
};

export const useTenantSettings = () => {
  return useQuery({
    queryKey: queryKeys.tenant.settings(),
    queryFn: getTenantSettings,
  });
};

export const useTenantStats = () => {
  return useQuery({
    queryKey: queryKeys.tenant.stats(),
    queryFn: getTenantStats,
  });
};

/**
 * Écritures du salon. Les deux mutations invalident aussi la vitrine publique :
 * changer le nom, le slug, une couleur ou une description change la page que
 * voient les clientes — pas seulement l'écran de réglages. Le slug est le cas
 * extrême : il déplace l'adresse entière.
 */
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: TenantIdentityInput) => updateTenant(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.currentUser });
      /* La vue du jour porte le nom du salon : sans cette invalidation, changer
         l'identité faisait changer les Réglages et la vitrine, mais pas l'écran
         d'arrivée — c'est exactement le « ça n'agit pas sur mon espace ». */
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useUpdateTenantSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: TenantAppearanceInput) => updateTenantSettings(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicSalon.all });
    },
  });
};
