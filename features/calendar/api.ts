import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { CalendarParams, FreeSlot, OccupiedSlot } from "./types";

/** `GET /calendar/occupied` — ce qui est déjà réservé ce jour-là. */
export const getOccupiedSlots = async ({ date, staffId }: CalendarParams) => {
  const params = { date, ...(staffId ? { staffId } : {}) };
  const { data } = await api.get<unknown>("/calendar/occupied", { params });
  return apiPayload<OccupiedSlot[]>(data);
};

/** `GET /calendar/slots` — la grille du jour, créneau par créneau. */
export const getCalendarSlots = async ({ date, staffId, serviceId }: CalendarParams) => {
  const params = {
    date,
    ...(staffId ? { staffId } : {}),
    ...(serviceId ? { serviceId } : {}),
  };
  const { data } = await api.get<unknown>("/calendar/slots", { params });
  return apiPayload<FreeSlot[]>(data);
};
