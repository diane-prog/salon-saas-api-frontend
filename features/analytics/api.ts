import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { AnalyticsOverview, AnalyticsRange } from "./types";

/**
 * `GET /analytics/overview?from&to` — la période est portée par l'URL.
 *
 * `GET /analytics/revenue` existe aussi, mais renvoie un sous-ensemble de cet
 * objet (`total`, `average`, `byDay`) : une seule requête suffit donc à l'écran,
 * et deux sources pour les mêmes chiffres ne peuvent pas diverger.
 */
export const getAnalyticsOverview = async ({ from, to }: AnalyticsRange) => {
  const { data } = await api.get<unknown>("/analytics/overview", { params: { from, to } });
  return apiPayload<AnalyticsOverview>(data);
};
