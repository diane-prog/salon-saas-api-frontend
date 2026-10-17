import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createStaffMember,
  deleteStaffMember,
  getStaffAvailability,
  getStaffMember,
  getStaffMembers,
  setStaffAvailability,
  updateStaffMember,
} from "./api";
import type { StaffAvailabilitySlot, StaffInput, StaffMember } from "./types";

/**
 * Équipe du salon. La clé est celle de `queryKeys.staff.list({})` : la liste est
 * partagée avec les écrans qui ont besoin des noms (rendez-vous), donc un seul
 * aller-retour par session pour toute l'équipe.
 */
export const useStaffMembers = () => {
  return useQuery({
    queryKey: queryKeys.staff.list({}),
    queryFn: getStaffMembers,
  });
};

export const useCreateStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StaffInput) => createStaffMember(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
};

export const useUpdateStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Partial<StaffInput> & { id: string }) => updateStaffMember(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
};

/** Un membre par son identifiant, pour rouvrir sa fiche sur l'état courant. */
export const useStaffMember = (id: string | null, initialData?: StaffMember) => {
  return useQuery({
    queryKey: queryKeys.staff.detail(id ?? ""),
    queryFn: () => getStaffMember(id as string),
    enabled: Boolean(id),
    initialData,
  });
};

/**
 * Supprimer un membre invalide son planning et le calendrier : les créneaux
 * libres d'un membre qui n'existe plus ne doivent pas rester proposés.
 */
export const useDeleteStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.stats() });
    },
  });
};

/**
 * Disponibilité d'un membre. La requête reste désactivée tant que la feuille
 * n'est pas ouverte (`enabled`) : afficher la liste de l'équipe ne doit pas
 * déclencher sept lectures de créneaux.
 */
export const useStaffAvailability = (staffId: string | null, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.staff.availability(staffId ?? ""),
    queryFn: () => getStaffAvailability(staffId as string),
    enabled: enabled && Boolean(staffId),
  });
};

export const useSetStaffAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { id: string; slots: StaffAvailabilitySlot[] }) =>
      setStaffAvailability(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availability(variables.id) });
      /* Le calendrier lit des créneaux libres : une semaine qui change le rend
         périmé, et il n'a aucun autre signal pour l'apprendre. */
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
};
