"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Empty, LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useMarkNotificationRead, useMyNotifications } from "@/features/notifications/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Notifications de la personne connectée.
 *
 * Lecture `/notifications/me` et une seule écriture : marquer lu. L'écran ne
 * fabrique aucune notification — il n'y a pas de route pour en créer une, et les
 * envois (e-mail, SMS) partent du backend. Une liste vide est donc normale.
 *
 * La route `/notifications` (tout le salon) existe aussi ; elle n'est pas
 * utilisée ici parce qu'une notification est adressée à une personne. Elle sera
 * branchée le jour où un écran d'administration du salon en aura besoin.
 */
export default function NotificationsPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.notifications;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const notificationsQ = useMyNotifications();
  const markRead = useMarkNotificationRead();

  const rows = notificationsQ.data ?? [];

  const stamp = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat(intlLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={dict.ui.dashboard.nav.notifications}
        title={labels.title}
        lead={labels.lead}
      />

      {markRead.isError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
          {apiErrorMessage(markRead.error, dict.ui.dashboard.errorBody)}
        </p>
      )}

      {notificationsQ.isPending && <Loading />}

      {notificationsQ.isError && <LoadError onRetry={() => notificationsQ.refetch()} />}

      {notificationsQ.isSuccess && rows.length === 0 && (
        <Empty title={labels.emptyTitle} body={labels.emptyBody} />
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className={`${LABEL} text-ink/40`}>
            {rows.length} {labels.count}
          </span>

          <ul className="flex flex-col gap-3">
            {rows.map((notification) => (
              <li key={notification.id} className={`border bg-white p-5 ${RULE}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-sm text-ink">
                    {notification.subject?.trim() || notification.type}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className={`${LABEL} ${notification.status === "READ" ? "text-ink/30" : "text-orange"}`}>
                      {labels.statuses[notification.status] ?? notification.status}
                    </span>

                    {notification.status !== "READ" && (
                      <button
                        type="button"
                        onClick={() => markRead.mutate(notification.id)}
                        disabled={markRead.isPending && markRead.variables === notification.id}
                        className="border border-ink/15 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
                      >
                        {labels.markRead}
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink/70">
                  {notification.message}
                </p>

                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.12em] text-ink/35">
                  {labels.channels[notification.channel] ?? notification.channel}
                  {stamp(notification.createdAt) && <> · {stamp(notification.createdAt)}</>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
