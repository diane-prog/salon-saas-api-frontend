import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { getAuditLogs, getAuditLogsByUser } from "./api";

/** Journal d'audit : la clé porte la limite demandée. */
export const useAuditLogs = (limit = 50) => {
  return useQuery({
    queryKey: queryKeys.audit.list({ limit }),
    queryFn: () => getAuditLogs(limit),
  });
};

/**
 * Journal filtré par auteur.
 *
 * La requête `null` est **désactivée** plutôt que d'appeler `/audit/logs/user/`
 * avec un identifiant vide : l'écran « tout le salon » doit rester une seule
 * lecture, pas une lecture inutile doublée d'une autre.
 */
export const useAuditLogsByUser = (userId: string | null, limit = 50) => {
  return useQuery({
    queryKey: queryKeys.audit.byUser(userId ?? ""),
    queryFn: () => getAuditLogsByUser(userId as string, limit),
    enabled: Boolean(userId),
  });
};
