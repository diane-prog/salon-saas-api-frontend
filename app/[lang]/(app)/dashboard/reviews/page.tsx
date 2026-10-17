"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { DataTable, type Column } from "@/components/workspace/DataTable";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import ReviewSheet from "@/components/workspace/ReviewSheet";
import {
  useApproveReview,
  useDeleteReview,
  useReviewStats,
  useReviews,
} from "@/features/reviews/queries";
import type { Review } from "@/features/reviews/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Modération des avis.
 *
 * Deux vérités à ne pas mélanger : la LISTE (filtrée par état) et la SYNTHÈSE
 * (`/reviews/stats`, sur tout le salon). Les deux sont lues séparément, et
 * approuver un avis invalide le domaine entier — la ligne quitte « En attente »
 * et le compteur baisse, sans rechargement manuel.
 *
 * L'écran ne propose que ce que le contrat permet : approuver et supprimer.
 * Désapprouver n'existe pas — un avis publié reste publié — mais `DELETE
 * /reviews/{id}` est bien au contrat, et c'est la seule façon de retirer un avis
 * qui n'aurait jamais dû arriver là. La suppression est confirmée dans la ligne.
 */
type Tab = "pending" | "published" | "all";

export default function ReviewsPage() {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.reviews;

  const [tab, setTab] = useState<Tab>("pending");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = tab === "pending" ? { approved: false } : tab === "published" ? { approved: true } : {};
  const reviewsQ = useReviews(filters);
  const statsQ = useReviewStats();
  const approve = useApproveReview();
  const remove = useDeleteReview();

  const rows = reviewsQ.data ?? [];
  const stats = statsQ.data;

  const columns: Column<Review>[] = [
    {
      key: "client",
      label: labels.columns.client,
      cell: (review) => (
        <span className="text-ink">{review.customerName?.trim() || labels.anonymous}</span>
      ),
    },
    {
      key: "rating",
      label: labels.columns.rating,
      numeric: true,
      cell: (review) => <span className="tabular-nums text-ink/75">{review.rating}/5</span>,
    },
    {
      key: "comment",
      label: labels.columns.comment,
      cell: (review) => (
        <span className="block max-w-md text-xs leading-relaxed text-ink/55">
          {review.comment?.trim() || "—"}
        </span>
      ),
    },
    {
      key: "source",
      label: labels.columns.source,
      cell: (review) => <span className="text-xs text-ink/50">{labels.sources[review.source]}</span>,
    },
    {
      key: "state",
      label: labels.columns.state,
      cell: (review) => (
        <span className={review.approved ? "text-xs text-ink/50" : "text-xs text-orange"}>
          {review.approved ? labels.states.published : labels.states.pending}
        </span>
      ),
    },
    {
      key: "action",
      label: "",
      cell: (review) => (
        <div className="flex items-center justify-end gap-3">
          {!review.approved && (
            <button
              type="button"
              onClick={() => approve.mutate(review.id)}
              disabled={approve.isPending && approve.variables === review.id}
              className="border border-brand/40 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-brand transition-colors hover:bg-brand/5 disabled:opacity-50"
            >
              {labels.approve}
            </button>
          )}
          <ConfirmButton
            label={labels.remove}
            question={labels.removeQuestion}
            busyLabel={labels.removeBusy}
            onConfirm={() => remove.mutateAsync(review.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.reviews} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
          >
            {labels.add}
          </button>
          <p className="text-xs text-ink/40">{labels.note}</p>
        </div>
      </PageHeader>

      {stats && (
        <dl className="grid gap-px bg-ink/10 sm:grid-cols-3">
          <div className="bg-white p-5">
            <dt className={`${LABEL} text-ink/40`}>{labels.stats.total}</dt>
            <dd className="mt-2 font-light text-3xl tabular-nums text-ink">{stats.total}</dd>
          </div>
          <div className="bg-white p-5">
            <dt className={`${LABEL} text-ink/40`}>{labels.stats.pending}</dt>
            <dd className="mt-2 font-light text-3xl tabular-nums text-ink">{stats.pending}</dd>
          </div>
          <div className="bg-white p-5">
            <dt className={`${LABEL} text-ink/40`}>{labels.stats.average}</dt>
            <dd className="mt-2 font-light text-3xl tabular-nums text-ink">
              {stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : "—"}
            </dd>
          </div>
        </dl>
      )}

      <div className="flex flex-wrap gap-1">
        {(["pending", "published", "all"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`border px-4 py-2 text-[0.64rem] uppercase tracking-[0.12em] transition-colors ${
              tab === key
                ? "border-transparent bg-ink text-paper"
                : "border-ink/15 text-ink/60 hover:border-ink/35"
            }`}
          >
            {labels.tabs[key]}
          </button>
        ))}
      </div>

      {approve.isError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {apiErrorMessage(approve.error, dict.ui.dashboard.errorBody)}
        </p>
      )}

      {reviewsQ.isPending && <Loading />}

      {reviewsQ.isError && <LoadError onRetry={() => reviewsQ.refetch()} />}

      {reviewsQ.isSuccess && rows.length === 0 && (
        <Empty title={labels.emptyTitle} body={labels.emptyBody} />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>
          <DataTable columns={columns} rows={rows} rowKey={(review) => review.id} minWidth="52rem" />
        </section>
      )}

      <ReviewSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
