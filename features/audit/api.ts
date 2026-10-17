import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { AuditLog } from "./types";

/**
 * `GET /audit/logs?limit=` — les dernières actions du salon.
 *
 * `limit` est documenté comme chaîne ; on l'envoie tel quel, et la valeur par
 * défaut reste côté écran (50) : assez pour lire une session de travail, pas
 * assez pour rapatrier des mois de journal.
 */
export const getAuditLogs = async (limit = 50) => {
  const { data } = await api.get<unknown>("/audit/logs", { params: { limit: String(limit) } });
  return apiPayload<AuditLog[]>(data);
};

/**
 * `GET /audit/logs/user/{userId}` — le journal d'une seule personne.
 *
 * Route distincte, et non un `?userId=` : le contrat expose les deux adresses
 * séparément. Elle sert à répondre à « qu'a fait untel ? », question qui se pose
 * quand plusieurs personnes se partagent un même salon.
 */
export const getAuditLogsByUser = async (userId: string, limit = 50) => {
  const { data } = await api.get<unknown>(`/audit/logs/user/${userId}`, {
    params: { limit: String(limit) },
  });
  return apiPayload<AuditLog[]>(data);
};
