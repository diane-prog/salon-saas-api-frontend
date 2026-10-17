import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { Customer, CustomerFilters, CustomerInput } from "./types";

/** `GET /customers` — recherche libre (`search`) et étiquette (`tag`). */
export const getCustomers = async (filters: CustomerFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value.trim() !== ""),
  );

  const { data } = await api.get<unknown>("/customers", { params });
  return apiPayload<Customer[]>(data);
};

/** `POST /customers` — la fiche se crée aussi à la main, pas seulement en ligne. */
export const createCustomer = async (dto: CustomerInput) => {
  const { data } = await api.post<unknown>("/customers", dto);
  return apiPayload<Customer>(data);
};

/** `PATCH /customers/{id}` — le contrat accepte un sous-ensemble des champs. */
export const updateCustomer = async ({ id, ...dto }: Partial<CustomerInput> & { id: string }) => {
  const { data } = await api.patch<unknown>(`/customers/${id}`, dto);
  return apiPayload<Customer>(data);
};

/**
 * `GET /customers/{id}` — une fiche fraîche.
 *
 * La liste rend déjà la fiche entière ; cette lecture sert au moment d'écrire :
 * rouvrir un formulaire sur des valeurs qui ont pu changer ailleurs évite
 * d'écraser une modification récente.
 */
export const getCustomer = async (id: string) => {
  const { data } = await api.get<unknown>(`/customers/${id}`);
  return apiPayload<Customer>(data);
};

/**
 * `DELETE /customers/{id}` — supprime la fiche et son historique.
 *
 * Les rendez-vous passés de cette personne perdent leur nom : l'écran demande
 * donc confirmation avant l'appel.
 */
export const deleteCustomer = async (id: string) => {
  await api.delete<unknown>(`/customers/${id}`);
  return id;
};
