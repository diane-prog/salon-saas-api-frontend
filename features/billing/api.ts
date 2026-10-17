import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { PlanInfo, Subscription, SubscriptionCurrent } from "./types";

/**
 * `GET /subscriptions/current` — **limites seulement** (`{ limits }`, souvent
 * vide). Le type le dit, pour qu'aucun écran n'y cherche un plan ou un statut
 * qui n'y sont pas.
 */
export const getCurrentSubscription = async () => {
  const { data } = await api.get<unknown>("/subscriptions/current");
  return apiPayload<SubscriptionCurrent>(data);
};

/** `GET /subscriptions/plans` — prix et quotas, lisible avec un jeton. */
export const getSubscriptionPlans = async () => {
  const { data } = await api.get<unknown>("/subscriptions/plans");
  return apiPayload<PlanInfo[]>(data);
};

/** `GET /subscriptions/history` — les abonnements passés, du plus récent au plus ancien. */
export const getSubscriptionHistory = async () => {
  const { data } = await api.get<unknown>("/subscriptions/history");
  return apiPayload<Subscription[]>(data);
};
