import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { Notification } from "./types";

/** `GET /notifications/me` — les notifications de la personne connectée. */
export const getMyNotifications = async (limit = 50) => {
  const { data } = await api.get<unknown>("/notifications/me", { params: { limit: String(limit) } });
  return apiPayload<Notification[]>(data);
};

/** `PATCH /notifications/{id}/read` — marque une notification comme lue. */
export const markNotificationRead = async (id: string) => {
  const { data } = await api.patch<unknown>(`/notifications/${id}/read`);
  return apiPayload<Notification>(data);
};
