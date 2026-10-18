import api from "@/lib/axios-config";
import type {
  AuthResponse,
  ForgotPasswordCredentials,
  LoginCredentials,
  MeResponse,
  OtpCredentials,
  OtpSentResponse,
  PasswordResetRequestedResponse,
  PasswordResetResponse,
  RegisterCredentials,
  ResendOtpCredentials,
  ResetPasswordCredentials,
} from "./types";

/**
 * Appels d'authentification — **même forme que
 * `ldmgV/ldmgwebsiteft/features/auth/api.ts`** : une fonction par endpoint, le
 * corps de la réponse rendu tel quel, et le jeton rangé dans `localStorage` au
 * moment où le backend le délivre.
 *
 * Le parcours réel du backend, en trois temps :
 *   1. `POST /auth/register` crée le salon et le compte propriétaire ;
 *   2. `POST /auth/login` ne connecte **pas** : il envoie un code à 6 chiffres
 *      (valable 10 minutes) ;
 *   3. `POST /auth/verify-otp` vérifie ce code et renvoie l'`accessToken`.
 */

export const login = async (credentials: LoginCredentials) => {
  const { data } = await api.post<OtpSentResponse>("/auth/login", credentials);
  return data;
};

export const resendOtp = async (credentials: ResendOtpCredentials) => {
  const { data } = await api.post<OtpSentResponse>("/auth/otp/resend", credentials);
  return data;
};

/**
 * Vérifie le code et **range le jeton** : c'est ici, et nulle part ailleurs,
 * que la session commence. L'intercepteur de `lib/axios-config.ts` relira
 * `localStorage.ACCESS_TOKEN` à chaque requête suivante.
 */
export const verifyOtp = async (credentials: OtpCredentials) => {
  const { data } = await api.post<AuthResponse>("/auth/verify-otp", credentials);
  localStorage.setItem("ACCESS_TOKEN", data.data.accessToken);
  return data;
};

/**
 * Mot de passe oublié : demande l'envoi d'un lien.
 *
 * La réponse est volontairement INDISTINCTE (200 que l'adresse existe ou non) : elle ne dit
 * jamais si un compte est rattaché à ce courriel. L'écran affiche donc le même accusé dans
 * les deux cas — ce n'est pas une approximation, c'est le contrat.
 */
export const forgotPassword = async (credentials: ForgotPasswordCredentials) => {
  const { data } = await api.post<PasswordResetRequestedResponse>(
    "/auth/password/forgot",
    credentials,
  );
  return data;
};

/**
 * Réinitialisation : le jeton du lien + le nouveau mot de passe.
 *
 * Aucune session n'est ouverte ici — le backend invalide les sessions existantes et toutes
 * les autres demandes de lien en attente. On repart donc de l'écran de connexion.
 */
export const resetPassword = async (credentials: ResetPasswordCredentials) => {
  const { data } = await api.post<PasswordResetResponse>("/auth/password/reset", credentials);
  return data;
};

export const register = async (credentials: RegisterCredentials) => {
  const { data } = await api.post<AuthResponse>("/auth/register", credentials);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
};

/**
 * Déconnexion. L'API n'expose **aucun** `/auth/logout` (le jeton est un JWT
 * autoportant : le serveur n'a rien à révoquer), donc la déconnexion est
 * strictement locale — on purge le stockage, ce qui suffit à couper l'accès.
 */
export const logout = async () => {
  localStorage.removeItem("ACCESS_TOKEN");
  localStorage.removeItem("REFRESH_TOKEN");

  return true;
};
