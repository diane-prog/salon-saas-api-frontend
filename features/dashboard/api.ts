import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { DashboardOverview } from "./types";

/** `GET /dashboard` — le résumé que le salon regarde en arrivant. */
export const getDashboardOverview = async () => {
  const { data } = await api.get<unknown>("/dashboard");
  return apiPayload<DashboardOverview>(data);
};
