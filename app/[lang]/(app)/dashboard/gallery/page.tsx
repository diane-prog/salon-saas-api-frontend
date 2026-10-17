"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import GalleryUploadSheet from "@/components/workspace/GalleryUploadSheet";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useDeleteGalleryImage, useGalleryImages } from "@/features/gallery/queries";
import { LABEL, PHOTO } from "@/lib/editorial";

/**
 * Galerie du salon.
 *
 * Ce que l'écran montre est exactement ce que la vitrine affiche : les images
 * publiées (`GET /gallery`). L'envoi (`POST /gallery/upload`, multipart) et la
 * suppression (`DELETE /gallery/{id}`) sont câblés : la galerie est le seul
 * contenu du salon que l'espace doit pouvoir alimenter lui-même.
 *
 * La suppression retire aussi le fichier de Cloudinary, côté serveur. Elle est
 * irréversible — d'où la confirmation dans la vignette, pas une flèche discrète
 * qui agit au premier clic.
 *
 * Les URLs viennent de Cloudinary, hors de toute liste blanche connue à la
 * compilation : `<img>` est assumé, plutôt qu'un composant d'image qui
 * refuserait un domaine configurable par salon.
 */
export default function GalleryPage() {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.gallery;

  const galleryQ = useGalleryImages();
  const remove = useDeleteGalleryImage();
  const rows = galleryQ.data ?? [];

  const [uploadOpen, setUploadOpen] = useState(false);

  const size = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    const units = ["o", "Ko", "Mo"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.gallery} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
          >
            {labels.add}
          </button>
          <p className="text-xs text-ink/40">{labels.note}</p>
        </div>
      </PageHeader>

      {galleryQ.isPending && <Loading />}

      {galleryQ.isError && <LoadError onRetry={() => galleryQ.refetch()} />}

      {galleryQ.isSuccess && rows.length === 0 && (
        <Empty
          title={labels.emptyTitle}
          body={labels.emptyBody}
          action={{ label: labels.add, onClick: () => setUploadOpen(true) }}
        />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rows.map((image) => (
              <li key={image.id} className="border border-ink/10 bg-white">
                <div className="relative aspect-square overflow-hidden bg-ink/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- image Cloudinary du salon, domaine non connu à la compilation */}
                  <img
                    src={image.secureUrl}
                    alt={image.caption ?? ""}
                    loading="lazy"
                    className={`h-full w-full ${PHOTO}`}
                  />
                </div>

                <div className="p-3">
                  <p className="truncate text-xs text-ink/70">
                    {image.caption?.trim() || labels.noCaption}
                  </p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-ink/35">
                    {image.format} · {size(image.bytes)}
                    {image.tags && image.tags.length > 0 && <> · {image.tags.join(" · ")}</>}
                  </p>

                  <div className="mt-3 flex justify-end">
                    <ConfirmButton
                      label={labels.remove}
                      question={labels.removeQuestion}
                      busyLabel={labels.removeBusy}
                      onConfirm={() => remove.mutateAsync(image.id)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GalleryUploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
