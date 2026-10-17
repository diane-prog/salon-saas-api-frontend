import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  getCurrentSubscription,
  getSubscriptionHistory,
  getSubscriptionPlans,
} from "./api";

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: queryKeys.billing.current(),
    queryFn: getCurrentSubscription,
  });
};

export const useSubscriptionHistory = () => {
  return useQuery({
    queryKey: queryKeys.billing.history(),
    queryFn: getSubscriptionHistory,
  });
};
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    queryFn: getSubscriptionPlans,
  });
};
