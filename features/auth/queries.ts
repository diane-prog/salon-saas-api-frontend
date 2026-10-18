import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "./api";
import type {
  ForgotPasswordCredentials,
  LoginCredentials,
  OtpCredentials,
  RegisterCredentials,
  ResendOtpCredentials,
  ResetPasswordCredentials,
} from "./types";

/**
 * Hooks d'authentification — **même logique que
 * `ldmgV/ldmgwebsiteft/features/auth/queries.ts`** : un `useQuery` pour
 * l'utilisateur courant, un `useMutation` par action, et le cache tenu à jour
 * dans les `onSuccess` (`setQueryData` à la connexion, `invalidateQueries` à la
 * déconnexion).
 *
 * `retry: false` sur `useCurrentUser` : un `401` n'est pas une panne réseau mais
 * une réponse — il ne faut pas la rejouer. C'est ce même refus qui évite de
 * mettre un 401 en cache et de laisser l'écran vide.
 */

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.users.currentUser,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/** Étape 1 : envoie le code à 6 chiffres. Ne connecte pas encore. */
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });
};

/** Étape 2 : vérifie le code, range le jeton, renseigne le cache utilisateur. */
export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: OtpCredentials) => verifyOtp(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.currentUser, {
        statusCode: data.statusCode,
        data: data.data.user,
      });
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (credentials: ResendOtpCredentials) => resendOtp(credentials),
  });
};

/** Mot de passe oublié : envoie le lien. Aucun cache à toucher, rien n'est connecté. */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (credentials: ForgotPasswordCredentials) => forgotPassword(credentials),
  });
};

/**
 * Réinitialisation : le jeton et le nouveau mot de passe.
 *
 * Au succès, tout jeton local est purgé — le mot de passe vient de changer, une session
 * ouverte avec l'ancien n'a plus de raison de rester sur cet appareil.
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: ResetPasswordCredentials) => resetPassword(credentials),
    onSuccess: () => {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      queryClient.setQueryData(queryKeys.users.currentUser, null);
    },
  });
};

/** Crée le salon et son compte propriétaire. Renvoie un jeton : on enchaîne sur l'OTP. */
export const useRegister = () => {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.users.currentUser, null);
      queryClient.invalidateQueries();
    },
  });
};
