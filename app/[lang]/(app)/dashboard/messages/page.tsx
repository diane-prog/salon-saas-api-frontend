"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import ConfirmButton from "@/components/workspace/ConfirmButton";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import {
  useContactMessages,
  useDeleteContactMessage,
  useMarkContactMessageRead,
} from "@/features/contact-messages/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Boîte de réception du salon.
 *
 * Les messages viennent de la vitrine (`POST /public/{slug}/contact`) et arrivent
 * non lus. L'écran fait exactement ce que le contrat permet : marquer comme lu
 * (`PATCH /contact-messages/{id}/read`) et supprimer (`DELETE
 * /contact-messages/{id}`). Il n'y a **pas** de réponse depuis l'application —
 * aucune route ne l'expose — donc pas de bouton « Répondre » qui ne mènerait
 * nulle part ; l'e-mail du client est cliquable.
 */
type Tab = "unread" | "all";

export default function MessagesPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.messages;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const [tab, setTab] = useState<Tab>("unread");

  const messagesQ = useContactMessages(tab === "unread" ? { read: false } : {});
  const markRead = useMarkContactMessageRead();
  const remove = useDeleteContactMessage();

  const rows = messagesQ.data ?? [];

  const date = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(parsed);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.messages} title={labels.title} lead={labels.lead} />

      <div className="flex flex-wrap gap-1">
        {(["unread", "all"] as const).map((key) => (
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

      {markRead.isError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {apiErrorMessage(markRead.error, dict.ui.dashboard.errorBody)}
        </p>
      )}

      {messagesQ.isPending && <Loading />}

      {messagesQ.isError && <LoadError onRetry={() => messagesQ.refetch()} />}

      {messagesQ.isSuccess && rows.length === 0 && (
        <Empty
          title={tab === "unread" ? labels.emptyUnreadTitle : labels.emptyTitle}
          body={tab === "unread" ? labels.emptyUnreadBody : labels.emptyBody}
        />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>

          <ul className="flex flex-col gap-3">
            {rows.map((message) => (
              <li key={message.id} className={`border bg-white p-5 ${RULE}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      {message.name}
                      {message.subject?.trim() && (
                        <span className="text-ink/50"> · {message.subject}</span>
                      )}
                      {!message.subject?.trim() && (
                        <span className="text-ink/35"> · {labels.noSubject}</span>
                      )}
                    </p>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/50">
                      <a href={`mailto:${message.email}`} className="underline-offset-4 hover:underline">
                        {message.email}
                      </a>
                      {message.phone && (
                        <a href={`tel:${message.phone}`} className="tabular-nums underline-offset-4 hover:underline">
                          {message.phone}
                        </a>
                      )}
                      {date(message.createdAt) && <span>{date(message.createdAt)}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`${LABEL} ${message.read ? "text-ink/30" : "text-orange"}`}>
                      {message.read ? labels.read : labels.unread}
                    </span>

                    {!message.read && (
                      <button
                        type="button"
                        onClick={() => markRead.mutate(message.id)}
                        disabled={markRead.isPending && markRead.variables === message.id}
                        className="border border-ink/15 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
                      >
                        {labels.markRead}
                      </button>
                    )}

                    <ConfirmButton
                      label={labels.remove}
                      question={labels.removeQuestion}
                      busyLabel={labels.removeBusy}
                      onConfirm={() => remove.mutateAsync(message.id)}
                    />
                  </div>
                </div>

                <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink/70">
                  {message.message}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
