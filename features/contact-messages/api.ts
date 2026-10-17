import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { ContactMessage, ContactMessageFilters } from "./types";

/** `GET /contact-messages` — la boîte du salon, filtrable par état de lecture. */
export const getContactMessages = async (filters: ContactMessageFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );

  const { data } = await api.get<unknown>("/contact-messages", { params });
  return apiPayload<ContactMessage[]>(data);
};

/** `PATCH /contact-messages/{id}/read` — marque le message comme lu. */
export const markContactMessageRead = async (id: string) => {
  const { data } = await api.patch<unknown>(`/contact-messages/${id}/read`);
  return apiPayload<ContactMessage>(data);
};

/** `DELETE /contact-messages/{id}` — retire la demande de la boîte, définitivement. */
export const deleteContactMessage = async (id: string) => {
  await api.delete<unknown>(`/contact-messages/${id}`);
  return id;
};
