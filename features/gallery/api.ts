import api from "@/lib/axios-config";
import { apiPayload } from "@/lib/api-payload";
import type { GalleryImage } from "./types";

/**
 * `GET /gallery` — les images du salon.
 *
 * Les filtres (`staffId`, `serviceId`, `tag`) sont documentés mais l'écran ne
 * les propose pas encore : une galerie se parcourt, elle ne se filtre pas
 * d'abord. La fonction les accepte quand même, pour ne pas avoir à la réécrire.
 */
export const getGalleryImages = async (
  filters: { staffId?: string; serviceId?: string; tag?: string } = {},
) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );

  const { data } = await api.get<unknown>("/gallery", { params });
  return apiPayload<GalleryImage[]>(data);
};

/**
 * `POST /gallery/upload` — envoi multipart, stockage Cloudinary.
 *
 * Le `Content-Type` est posé explicitement : l'instance axios déclare du JSON
 * par défaut, et sans cette ligne un `FormData` serait sérialisé en JSON — le
 * fichier partirait sous forme d'objet vide. `FormData` laisse le navigateur
 * écrire lui-même la frontière multipart.
 */
export const uploadGalleryImage = async ({
  file,
  caption,
  tags,
  staffId,
  serviceId,
}: {
  file: File;
  caption?: string;
  tags?: string;
  staffId?: string;
  serviceId?: string;
}) => {
  const form = new FormData();
  form.append("file", file);
  if (caption?.trim()) form.append("caption", caption.trim());
  if (tags?.trim()) form.append("tags", tags.trim());
  if (staffId) form.append("staffId", staffId);
  if (serviceId) form.append("serviceId", serviceId);

  const { data } = await api.post<unknown>("/gallery/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return apiPayload<GalleryImage>(data);
};

/**
 * `DELETE /gallery/{id}` — retire l'image de la galerie **et** de Cloudinary.
 *
 * La route rend l'entité supprimée, pas un booléen : l'appelant n'a donc rien à
 * interpréter, et un `204` sans corps retomberait sur `undefined` sans erreur.
 */
export const deleteGalleryImage = async (id: string) => {
  await api.delete<unknown>(`/gallery/${id}`);
  return id;
};
