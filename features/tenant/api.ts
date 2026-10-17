import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type {
  Tenant,
  TenantAppearanceInput,
  TenantIdentityInput,
  TenantSettings,
  TenantStats,
} from "./types";

/** `GET /tenant/me` — identité du salon connecté. */
export const getTenant = async () => {
  const { data } = await api.get<unknown>("/tenant/me");
  return apiPayload<Tenant>(data);
};

/** `GET /tenant/settings` — couleurs, logo, description, réseaux. */
export const getTenantSettings = async () => {
  const { data } = await api.get<unknown>("/tenant/settings");
  return apiPayload<TenantSettings>(data);
};

/**
 * `GET /tenant/stats` — compteurs d'usage.
 *
 * C'est la seule lecture qui donne le nombre de photos, de membres et de
 * rendez-vous du salon : elle sert donc à la fois aux réglages et au tableau de
 * bord, sans additionner des listes côté navigateur.
 */
export const getTenantStats = async () => {
  const { data } = await api.get<unknown>("/tenant/stats");
  return apiPayload<TenantStats>(data);
};

/** `PATCH /tenant/me` — identité du salon (OWNER / ADMIN seulement). */
export const updateTenant = async (dto: TenantIdentityInput) => {
  const { data } = await api.patch<unknown>("/tenant/me", dto);
  return apiPayload<Tenant>(data);
};

/** `PATCH /tenant/settings` — apparence et réseaux. */
export const updateTenantSettings = async (dto: TenantAppearanceInput) => {
  const { data } = await api.patch<unknown>("/tenant/settings", dto);
  return apiPayload<TenantSettings>(data);
};
