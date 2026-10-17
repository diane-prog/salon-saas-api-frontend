import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { getDashboardOverview } from "./api";

/** Résumé du jour. Clé unique : la page ne le lit qu'une fois. */
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardOverview,
  });
};
