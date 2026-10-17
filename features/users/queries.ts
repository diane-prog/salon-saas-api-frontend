import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  getCurrentAccount,
  updateAccount,
} from "./api";
import type { Account, AccountInput, AccountUpdate } from "./types";

export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.users.list({}),
    queryFn: getAccounts,
  });
};

/** Profil de la personne connectée : une seule lecture, gardée pour la session. */
export const useCurrentAccount = () => {
  return useQuery({
    queryKey: [...queryKeys.users.currentUser, "account"],
    queryFn: getCurrentAccount,
  });
};

/** Un compte par son identifiant, pour rouvrir sa fiche sur l'état courant. */
export const useAccount = (id: string | null, initialData?: Account) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => getAccount(id as string),
    enabled: Boolean(id),
    initialData,
  });
};

/**
 * Ouverture d'un accès.
 *
 * Le journal d'audit enregistre la création côté serveur : il est invalidé au
 * passage, sinon la ligne n'apparaîtrait qu'au prochain chargement de l'écran.
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AccountInput) => createAccount(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};

/**
 * Modification d'un compte.
 *
 * Le profil de la personne connectée est invalidé **aussi** : elle peut changer
 * son propre prénom ou son rôle depuis cet écran, et la coquille de l'espace
 * salon lit ce profil.
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AccountUpdate & { id: string }) => updateAccount(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      /* Le profil de la personne connectée vit sous sa propre clé (`currentUser`),
         hors de `users.all` : sans cette ligne, changer son propre prénom ne se
         verrait nulle part avant un rechargement. */
      queryClient.invalidateQueries({ queryKey: queryKeys.users.currentUser });
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.all });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};
