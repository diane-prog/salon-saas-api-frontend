"use client";

import { useEffect, useRef, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import { useUploadGalleryImage } from "@/features/gallery/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/** Taille maximale acceptée par l'API (10 Mo) — contrôlée avant l'envoi. */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Envoi d'une photo dans la galerie.
 *
 * Le fichier est validé **avant** l'aller-retour : type (`image/*`) et taille
 * (10 Mo, la limite de l'API). Laisser partir un fichier de 40 Mo pour lire un
 * `400` au bout d'une minute est une perte pour la personne qui attend devant
 * l'écran, pas une vérification de sécurité.
 *
 * L'aperçu se fait par `URL.createObjectURL`, révoquée à chaque changement :
 * un aperçu oublié garde le fichier en mémoire tant que l'onglet vit.
 */
export default function GalleryUploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.gallery;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.uploadTitle}
      description={labels.uploadBody}
    >
      <GalleryUploadForm onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function GalleryUploadForm({ onDone }: { onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.gallery;

  const upload = useUploadGalleryImage();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const pending = upload.isPending;

  /* L'aperçu est un fichier en mémoire tant que son URL vit : elle est révoquée
     quand elle est remplacée, et à la fermeture de la feuille. */
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = (candidate: File | null) => {
    setError(null);

    if (!candidate) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!candidate.type.startsWith("image/")) {
      setError(labels.notImage);
      setFile(null);
      setPreview(null);
      return;
    }

    if (candidate.size > MAX_BYTES) {
      setError(labels.tooBig);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(candidate);
    setPreview(URL.createObjectURL(candidate));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setError(labels.noFile);
      return;
    }

    setError(null);
    setFormError(null);

    try {
      await upload.mutateAsync({ file, caption, tags });
      onDone();
    } catch (caught) {
      setFormError(apiErrorMessage(caught, dict.ui.dashboard.errorBody));
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.file} *</span>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="border border-dashed border-ink/25 bg-white px-4 py-8 text-xs text-ink/50 transition-colors hover:border-brand hover:text-ink disabled:opacity-60"
        >
          {file ? file.name : labels.chooseFile}
        </button>

        {preview && (
          <div className="mt-1 overflow-hidden border border-ink/10 bg-ink/[0.04]">
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob), pas une image distante */}
            <img src={preview} alt="" className="max-h-56 w-full object-cover" />
          </div>
        )}
      </div>

      <Field
        label={labels.fields.caption}
        name="caption"
        value={caption}
        onChange={setCaption}
        maxLength={160}
        disabled={pending}
      />

      <Field
        label={labels.fields.tags}
        name="tags"
        hint={labels.tagsHint}
        value={tags}
        onChange={setTags}
        disabled={pending}
      />

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {formError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {formError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="border border-ink/15 px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:border-ink/40 disabled:opacity-50"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {pending ? labels.uploading : labels.upload}
        </button>
      </div>
    </form>
  );
}
