import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
  AppointmentUpdate,
} from "./types";

/**
 * Endpoints **authentifiés** des rendez-vous.
 *
 * Le jeton est posé par `lib/axios-config` à chaque requête ; rien à faire ici.
 * `GET /appointments` accepte un jour précis (`date`) ou une période (`from` /
 * `to`) : on n'envoie que les clés réellement choisies, pour ne pas demander au
 * serveur de filtrer sur des chaînes vides.
 */

export const getAppointments = async (filters: AppointmentFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );

  const { data } = await api.get<unknown>("/appointments", { params });
  return apiPayload<Appointment[]>(data);
};

/**
 * `POST /appointments` — prendre un rendez-vous au comptoir.
 *
 * La durée et le prix ne sont pas envoyés : le serveur les déduit de la
 * prestation choisie. Le rendez-vous revient en `PENDING`, comme une
 * réservation en ligne — c'est l'écran qui l'affiche tel quel.
 */
export const createAppointment = async (dto: AppointmentInput) => {
  const { data } = await api.post<unknown>("/appointments", dto);
  return apiPayload<Appointment>(data);
};

/**
 * `GET /appointments/{id}` — un rendez-vous précis.
 *
 * La liste suffit pour afficher une journée, mais pas pour rouvrir une fiche
 * pendant qu'un autre poste la modifie : la lecture par identifiant est la seule
 * qui garantisse l'état courant au moment où l'on écrit.
 */
export const getAppointment = async (id: string) => {
  const { data } = await api.get<unknown>(`/appointments/${id}`);
  return apiPayload<Appointment>(data);
};

/**
 * `DELETE /appointments/{id}` — annulation définitive.
 *
 * À ne pas confondre avec le statut `CANCELLED` : annuler garde la trace du
 * rendez-vous et libère le créneau, supprimer l'efface. L'écran propose les deux,
 * et le dit.
 */
export const deleteAppointment = async (id: string) => {
  await api.delete<unknown>(`/appointments/${id}`);
  return id;
};

/**
 * `PATCH /appointments/{id}` — le geste du quotidien : faire avancer un statut.
 * On n'envoie que ce qui change (`{ status }`), jamais l'objet entier : le
 * backend recalcule durée, prix et fin selon la prestation.
 */
export const updateAppointment = async ({
  id,
  ...dto
}: AppointmentUpdate & { id: string }) => {
  const { data } = await api.patch<unknown>(`/appointments/${id}`, dto);
  return apiPayload<Appointment>(data);
};
