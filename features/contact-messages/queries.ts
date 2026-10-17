import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  deleteContactMessage,
  getContactMessages,
  markContactMessageRead,
} from "./api";
import type { ContactMessageFilters } from "./types";

export const useContactMessages = (filters: ContactMessageFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.contactMessages.list(filters),
    queryFn: () => getContactMessages(filters),
  });
};

/** Marquer lu change les deux filtres possibles (`read=true` et `read=false`). */
export const useMarkContactMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markContactMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all });
    },
  });
};

/** Supprimer un message retire la ligne des deux onglets (« non lus » et « tous »). */
export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all });
    },
  });
};
