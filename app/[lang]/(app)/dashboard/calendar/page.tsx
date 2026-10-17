"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { LoadError, Loading, PageHeader } from "@/components/workspace/States";
import { useCalendarSlots, useOccupiedSlots } from "@/features/calendar/queries";
import { useStaffMembers } from "@/features/staff/queries";
import { BODY, LABEL, RULE } from "@/lib/editorial";

/**
 * Calendrier du jour.
 *
 * Deux lectures, parce que le backend en expose deux et qu'elles ne disent pas
 * la même chose :
 *   - `/calendar/occupied` : les blocs PRIS, avec leur statut de rendez-vous ;
 *   - `/calendar/slots`    : la grille calculée, avec `available` par créneau.
 *
 * L'écran montre les deux côte à côte : ce qui est pris, et ce qui reste. Il ne
 * déduit jamais le libre de l'occupé — c'est le serveur qui décide, et la grille
 * peut être vide parce qu'aucune disponibilité n'est configurée.
 *
 * Les heures sont locales au salon (`HH:mm`) : elles sont affichées telles
 * quelles, jamais converties.
 */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.calendar;

  const [date, setDate] = useState(todayUtc);
  const [staffId, setStaffId] = useState("");

  const staffQ = useStaffMembers();
  const occupiedQ = useOccupiedSlots({ date, staffId: staffId || undefined });
  const slotsQ = useCalendarSlots({ date, staffId: staffId || undefined });

  const occupied = occupiedQ.data ?? [];
  const free = (slotsQ.data ?? []).filter((slot) => slot.available);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.calendar} title={labels.title} lead={labels.lead}>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-2">
            <span className={`${LABEL} text-ink/40`}>{labels.dateLabel}</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={`${LABEL} text-ink/40`}>{labels.staffLabel}</span>
            <select
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              className="border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="">{labels.allStaff}</option>
              {(staffQ.data ?? []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`border bg-white ${RULE}`}>
          <h2 className={`${LABEL} border-b px-5 py-4 text-ink/40 ${RULE}`}>{labels.busy}</h2>

          <div className="p-5">
            {occupiedQ.isPending && <Loading />}
            {occupiedQ.isError && <LoadError onRetry={() => occupiedQ.refetch()} />}
            {occupiedQ.isSuccess && occupied.length === 0 && (
              <p className={`${BODY} text-ink/45`}>{labels.emptyBusy}</p>
            )}

            {occupied.length > 0 && (
              <ul>
                {occupied.map((slot) => (
                  <li
                    key={`${slot.appointmentId}-${slot.startTime}`}
                    className="flex items-baseline justify-between gap-3 border-b border-navy/[0.06] py-3 text-sm last:border-0"
                  >
                    <span className="tabular-nums text-ink">
                      {slot.startTime}
                      <span className="text-ink/35"> → {slot.endTime}</span>
                    </span>
                    <span className={`${LABEL} text-ink/40`}>
                      {dict.ui.dashboard.screens.appointments.statuses[
                        slot.status as keyof typeof dict.ui.dashboard.screens.appointments.statuses
                      ] ?? slot.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={`border bg-white ${RULE}`}>
          <h2 className={`${LABEL} border-b px-5 py-4 text-ink/40 ${RULE}`}>
            {labels.free} · {free.length}
          </h2>

          <div className="p-5">
            {slotsQ.isPending && <Loading />}
            {slotsQ.isError && <LoadError onRetry={() => slotsQ.refetch()} />}
            {slotsQ.isSuccess && free.length === 0 && (
              <p className={`${BODY} text-ink/45`}>{labels.emptyFree}</p>
            )}

            {free.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {free.map((slot) => (
                  <li
                    key={slot.startTime}
                    className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm tabular-nums text-ink"
                  >
                    {slot.startTime}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
