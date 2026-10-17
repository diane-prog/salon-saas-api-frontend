import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { getMyNotifications, markNotificationRead } from "./api";

export const useMyNotifications = (limit = 50) => {
  return useQuery({
    queryKey: queryKeys.notifications.mine(),
    queryFn: () => getMyNotifications(limit),
  });
};

/** Marquer lu change le badge et la ligne : tout le domaine est invalidé. */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
