import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { Account, AccountInput, AccountUpdate } from "./types";

/** `GET /users` — les comptes qui peuvent se connecter au salon. */
export const getAccounts = async () => {
  const { data } = await api.get<unknown>("/users");
  return apiPayload<Account[]>(data);
};

/**
 * `GET /users/me` — le profil complet de la personne connectée.
 *
 * Distinct de `/auth/me`, qui ne rend que l'identité de session (id, e-mail,
 * rôle, salon) : ici on a le prénom, le nom, le téléphone et la date de dernière
 * connexion. L'écran des comptes s'en sert pour marquer « vous ».
 */
export const getCurrentAccount = async () => {
  const { data } = await api.get<unknown>("/users/me");
  return apiPayload<Account>(data);
};

/** `POST /users` — ouvre un accès (OWNER ou ADMIN, selon le rôle demandé). */
export const createAccount = async (dto: AccountInput) => {
  const { data } = await api.post<unknown>("/users", dto);
  return apiPayload<Account>(data);
};

/** `GET /users/{id}` — un compte précis, pour rouvrir sa fiche à jour. */
export const getAccount = async (id: string) => {
  const { data } = await api.get<unknown>(`/users/${id}`);
  return apiPayload<Account>(data);
};

/** `PATCH /users/{id}` — rôle, état, identité, et mot de passe si fourni. */
export const updateAccount = async ({ id, ...dto }: AccountUpdate & { id: string }) => {
  const { data } = await api.patch<unknown>(`/users/${id}`, dto);
  return apiPayload<Account>(data);
};

/** `DELETE /users/{id}` — réservé au propriétaire côté serveur. */
export const deleteAccount = async (id: string) => {
  await api.delete<unknown>(`/users/${id}`);
  return id;
};
