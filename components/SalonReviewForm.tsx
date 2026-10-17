"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import { useCreateSalonReview } from "@/features/public-salon/queries";
import { apiErrorMessage } from "@/lib/api-error";

/**
 * Dépôt d'un avis depuis la vitrine — `POST /public/{slug}/reviews`.
 *
 * L'avis n'apparaît pas tout de suite sur la page : il part en modération, et
 * `SalonPage` l'annonce déjà (« les avis sont publiés après validation »). La
 * confirmation le redit plutôt que de laisser croire que la note est en ligne —
 * une cliente qui recharge la page et ne voit rien croirait à un échec.
 *
 * Le contrat n'exige que `rating` ; `customerName` et `comment` sont facultatifs
 * mais le nom est demandé : un avis anonyme n'aide personne à se décider.
 * `appointmentId`, `serviceId` et `staffId` ne sont pas envoyés : la vitrine ne
 * sait pas quel rendez-vous la personne a eu, et l'inventer fausserait la note
 * par prestation.
 */
export default function SalonReviewForm({
  slug,
  primary,
  accent,
}: {
  slug: string;
  primary: string;
  accent: string;
}) {
  const { dict } = useDictionary();
  const t = dict.storefront.review;

  const create = useCreateSalonReview();
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating < 1) {
      setError(t.requiredRating);
      return;
    }

    setError(null);

    create.mutate(
      {
        slug,
        rating,
        ...(name.trim() ? { customerName: name.trim() } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      },
      { onSuccess: () => setSent(true) },
    );
  };

  if (sent) {
    return (
      <div aria-live="polite" className="border-t border-ink/10 pt-6">
        <h3 className="font-light text-xl text-ink">{t.successTitle}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">{t.successBody}</p>
        <button
          type="button"
          onClick={() => {
            setRating(0);
            setName("");
            setComment("");
            setSent(false);
          }}
          className="mt-5 rounded-full border border-ink/15 px-5 py-2.5 text-xs text-ink/70 transition-colors hover:border-ink/35"
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5 border-t border-ink/10 pt-6">
      <div>
        <h3 className="font-light text-xl text-ink">{t.title}</h3>
        <p className="mt-1 text-xs text-ink/50">{t.lead}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-medium uppercase tracking-wider text-navy">{t.rating}</legend>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= rating;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRating(value);
                  setError(null);
                }}
                aria-pressed={rating === value}
                aria-label={`${value}/5`}
                className={`h-9 w-9 rounded-full border text-sm tabular-nums transition-colors ${
                  active ? "border-transparent text-white" : "border-ink/15 text-ink/60 hover:border-ink/35"
                }`}
                style={active ? { background: accent } : undefined}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.name}
          name="review-name"
          autoComplete="name"
          value={name}
          onChange={setName}
          disabled={create.isPending}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-navy">{t.comment}</span>
        <textarea
          name="review-comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={create.isPending}
          placeholder={t.commentPlaceholder}
          className="w-full resize-y rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
        />
      </label>

      {(error || create.isError) && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
        >
          {error ?? apiErrorMessage(create.error, t.error)}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={create.isPending || rating < 1}
          className="rounded-full px-6 py-3 text-sm font-light text-white transition-opacity disabled:opacity-40"
          style={{ background: primary }}
        >
          {create.isPending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
