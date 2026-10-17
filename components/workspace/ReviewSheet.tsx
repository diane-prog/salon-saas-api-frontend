"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import { useCreateReview } from "@/features/reviews/queries";
import type { ReviewInput } from "@/features/reviews/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Saisir un avis reçu au comptoir.
 *
 * `POST /reviews` (chemin authentifié) et non `POST /public/{slug}/reviews` : la
 * personne qui saisit est identifiée, l'avis porte donc la source `INTERNAL` et
 * se distingue, dans la liste, de ceux déposés sur la vitrine.
 *
 * TROIS CHAMPS, PAS PLUS. Le contrat accepte aussi un membre, une prestation et
 * un rendez-vous — mais les lier demande de savoir DE QUEL rendez-vous on parle,
 * et l'écran de modération ne part pas d'un rendez-vous : il part d'un avis à
 * saisir. Proposer un sélecteur de membre sans ce contexte ferait un lien juste
 * pour remplir un champ.
 *
 * L'avis part non approuvé : il apparaît dans « En attente » et ne rejoint la
 * vitrine qu'après publication. C'est la modération, pas la saisie, qui décide.
 */
export default function ReviewSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.reviews.form;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      description={labels.body}
    >
      <ReviewForm onDone={() => onOpenChange(false)} />
    </WorkspaceSheet>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.reviews.form;

  const create = useCreateReview();
  const pending = create.isPending;

  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const input: ReviewInput = {
      rating,
      customerName: customerName.trim() || undefined,
      comment: comment.trim() || undefined,
    };

    try {
      await create.mutateAsync(input);
      onDone();
    } catch (error) {
      setFormError(apiErrorMessage(error, dict.ui.dashboard.errorBody));
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <span className={`${LABEL} text-ink/50`}>
          {labels.fields.rating} <span className="text-orange">*</span>
        </span>

        {/* Cinq boutons plutôt qu'un sélecteur : une note se donne d'un geste,
            et le chiffre reste lisible sans ouvrir de liste. */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              aria-label={`${value}/5`}
              disabled={pending}
              className={`h-9 w-9 rounded-full border text-xs tabular-nums transition-colors ${
                value <= rating
                  ? "border-transparent bg-ink text-paper"
                  : "border-ink/15 text-ink/50 hover:border-ink/35"
              }`}
            >
              {value}
            </button>
          ))}

          <span className="ml-2 text-xs tabular-nums text-ink/45">{rating}/5</span>
        </div>
      </div>

      <Field
        label={labels.fields.customerName}
        name="customerName"
        hint={labels.customerNameHint}
        value={customerName}
        onChange={setCustomerName}
        maxLength={120}
        disabled={pending}
      />

      <label className="flex flex-col gap-2">
        <span className={`${LABEL} text-ink/50`}>{labels.fields.comment}</span>
        <textarea
          name="comment"
          rows={4}
          maxLength={2000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={pending}
          className="resize-y border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand disabled:opacity-60"
        />
      </label>

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
          {pending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
