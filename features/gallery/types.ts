/**
 * Image de la galerie du salon — `GalleryEntity`.
 *
 * Le stockage est Cloudinary : `publicId`, `secureUrl`, `format` et `bytes`
 * décrivent le fichier réel, et `caption` / `tags` son rangement. L'écran
 * n'affiche que ce que l'API rend — aucune image d'exemple. `id` suit la même
 * convention que les autres entités (absent du schéma, présent en réel).
 */
export interface GalleryImage {
  readonly id: string;
  readonly tenantId: string;
  readonly publicId: string;
  readonly url: string;
  readonly secureUrl: string;
  readonly format: string;
  readonly width?: number;
  readonly height?: number;
  readonly bytes: number;
  readonly folder: string;
  readonly caption?: string | null;
  readonly tags?: string[];
  readonly staffId?: string | null;
  readonly serviceId?: string | null;
  readonly uploadedBy?: string | null;
  readonly createdAt?: string;
}
