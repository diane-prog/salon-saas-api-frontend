import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  updateAppointment,
} from "./api";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
  AppointmentUpdate,
} from "./types";

/**
 * Liste des rendez-vous, filtrée. La clé porte le filtre entier
 * (`queryKeys.appointments.list(filters)`) : changer de jour change de clé, donc
 * la liste se recharge sans écraser celle d'un autre jour.
 */
export const useAppointments = (filters: AppointmentFilters) => {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => getAppointments(filters),
  });
};

/**
 * Changer un statut invalide TOUTES les listes de rendez-vous : la journée
 * affichée, mais aussi les autres jours mis en cache. La ligne change de statut
 * sans quitter l'écran.
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AppointmentUpdate & { id: string }) => updateAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
};

/**
 * Un rendez-vous par son identifiant, pour rouvrir une fiche fraîche.
 *
 * `initialData` est la ligne déjà affichée : la feuille s'ouvre donc avec les
 * valeurs connues, sans écran d'attente, puis se corrige si le serveur dit
 * autre chose. C'est ce qui protège d'une modification faite depuis un autre
 * poste entre l'affichage de la liste et l'ouverture de la fiche.
 */
export const useAppointment = (id: string | null, initialData?: Appointment) => {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id ?? ""),
    queryFn: () => getAppointment(id as string),
    enabled: Boolean(id),
    initialData,
  });
};

/**
 * Prendre un rendez-vous invalide le jour affiché **et** les compteurs : le
 * tableau de bord et le calendrier lisent tous deux les rendez-vous, et un
 * rendez-vous qui n'apparaît pas sur l'agenda du jour serait un faux vide.
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AppointmentInput) => createAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};
