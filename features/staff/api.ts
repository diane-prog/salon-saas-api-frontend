import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type {
  StaffAvailability,
  StaffAvailabilitySlot,
  StaffInput,
  StaffMember,
} from "./types";

/** `GET /staff` — équipe du salon connecté. Aucun filtre documenté. */
export const getStaffMembers = async () => {
  const { data } = await api.get<unknown>("/staff");
  return apiPayload<StaffMember[]>(data);
};

/** `POST /staff` — ajoute un membre (quota du forfait appliqué par le serveur). */
export const createStaffMember = async (dto: StaffInput) => {
  const { data } = await api.post<unknown>("/staff", dto);
  return apiPayload<StaffMember>(data);
};

/** `PATCH /staff/{id}` — mise à jour partielle. */
export const updateStaffMember = async ({ id, ...dto }: Partial<StaffInput> & { id: string }) => {
  const { data } = await api.patch<unknown>(`/staff/${id}`, dto);
  return apiPayload<StaffMember>(data);
};

/**
 * `GET /staff/{id}` — un membre précis.
 *
 * Utile au moment d'écrire : la fiche se rouvre sur l'état courant, pas sur la
 * ligne telle qu'elle était quand la liste a été chargée.
 */
export const getStaffMember = async (id: string) => {
  const { data } = await api.get<unknown>(`/staff/${id}`);
  return apiPayload<StaffMember>(data);
};

/**
 * `DELETE /staff/{id}` — supprime le membre de l'équipe.
 *
 * Ses rendez-vous passés gardent leur identifiant de membre : l'écran les
 * affichera « — ». Désactiver (case du formulaire) reste le geste recommandé
 * pour quelqu'un qui part ; supprimer efface l'appartenance à l'équipe.
 */
export const deleteStaffMember = async (id: string) => {
  await api.delete<unknown>(`/staff/${id}`);
  return id;
};

/** `GET /staff/{id}/availability` — la semaine type du membre. */
export const getStaffAvailability = async (id: string) => {
  const { data } = await api.get<unknown>(`/staff/${id}/availability`);
  return apiPayload<StaffAvailability[]>(data);
};

/**
 * `POST /staff/{id}/availability` — **remplace** la semaine entière.
 *
 * Ce n'est pas un ajout : la route reçoit la liste complète des créneaux et
 * efface l'ancienne. Un jour absent de l'envoi est donc un jour fermé, pas un
 * jour inchangé — l'écran envoie toujours les sept jours, même vides.
 */
export const setStaffAvailability = async ({
  id,
  slots,
}: {
  id: string;
  slots: StaffAvailabilitySlot[];
}) => {
  const { data } = await api.post<unknown>(`/staff/${id}/availability`, { slots });
  return apiPayload<StaffAvailability[]>(data);
};
