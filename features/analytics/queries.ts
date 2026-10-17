import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { getAnalyticsOverview } from "./api";
import type { AnalyticsRange } from "./types";

/** Chiffres du salon sur une période. La clé porte la période entière. */
export const useAnalyticsOverview = (range: AnalyticsRange) => {
  return useQuery({
    queryKey: queryKeys.analytics.overview(range),
    queryFn: () => getAnalyticsOverview(range),
  });
};
