"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import WorkspaceSheet from "@/components/workspace/WorkspaceSheet";
import { useSetStaffAvailability, useStaffAvailability } from "@/features/staff/queries";
import type { StaffAvailabilitySlot, StaffMember, Weekday } from "@/features/staff/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Disponibilités d'un membre — la semaine type, jour par jour.
 *
 * `POST /staff/{id}/availability` **remplace** la semaine : ce n'est pas une
 * liste à laquelle on ajoute, c'est une semaine qu'on réécrit. L'écran envoie
 * donc toujours les sept jours, y compris ceux qui n'ont aucun créneau — c'est
 * ainsi qu'on ferme un jour qui était ouvert.
 *
 * L'ordre d'affichage part du lundi, comme un agenda de salon, alors que le
 * backend numérote à partir du dimanche (0). La conversion se fait dans `WEEK`,
 * à un seul endroit.
 */

/** Lundi d'abord : l'ordre de lecture d'un agenda, pas celui du contrat. */
const WEEK: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

/** Une date fixe et connue pour n'employer `Intl` que comme traducteur de noms de jours. */
const MONDAY = Date.UTC(2026, 9, 19);

type Row = { startTime: string; endTime: string };
type Draft = Record<Weekday, Row[]>;

function draftFrom(slots: StaffAvailabilitySlot[]): Draft {
  const draft: Draft = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (const slot of slots) {
    draft[slot.dayOfWeek]?.push({ startTime: slot.startTime, endTime: slot.endTime });
  }

  return draft;
}

export default function AvailabilitySheet({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StaffMember | null;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.staff.availabilitySheet;

  return (
    <WorkspaceSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      description={
        member ? `${member.firstName} ${member.lastName} — ${labels.body}` : labels.body
      }
    >
      {member && open && (
        <AvailabilityForm staffId={member.id} onDone={() => onOpenChange(false)} />
      )}
    </WorkspaceSheet>
  );
}

function AvailabilityForm({ staffId, onDone }: { staffId: string; onDone: () => void }) {
  const { dict, locale } = useDictionary();

  const availabilityQ = useStaffAvailability(staffId);
  const save = useSetStaffAvailability();

  const dayName = (day: Weekday) => {
    const date = new Date(MONDAY + WEEK.indexOf(day) * 86_400_000);
    const label = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      weekday: "long",
    }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  if (availabilityQ.isPending) {
    return <p className={`${LABEL} text-ink/40`}>{dict.ui.dashboard.loading}</p>;
  }

  if (availabilityQ.isError) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">{dict.ui.dashboard.errorBody}</p>
        <button
          type="button"
          onClick={() => availabilityQ.refetch()}
          className="self-start bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
        >
          {dict.ui.dashboard.retry}
        </button>
      </div>
    );
  }

  return (
    <AvailabilityEditor
      initial={availabilityQ.data ?? []}
      dayName={dayName}
      busy={save.isPending}
      onCancel={onDone}
      onSave={async (draft) => {
        const slots: StaffAvailabilitySlot[] = [];
        for (const day of WEEK) {
          for (const row of draft[day]) {
            slots.push({
              dayOfWeek: day,
              startTime: row.startTime,
              endTime: row.endTime,
              active: true,
            });
          }
        }
        await save.mutateAsync({ id: staffId, slots });
        onDone();
      }}
    />
  );
}

function AvailabilityEditor({
  initial,
  dayName,
  busy,
  onCancel,
  onSave,
}: {
  initial: StaffAvailabilitySlot[];
  dayName: (day: Weekday) => string;
  busy: boolean;
  onCancel: () => void;
  onSave: (draft: Draft) => Promise<void>;
}) {
  const { dict } = useDictionary();
  const labels = dict.ui.dashboard.screens.staff.availabilitySheet;

  const [draft, setDraft] = useState<Draft>(() => draftFrom(initial));
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const update = (day: Weekday, index: number, patch: Partial<Row>) => {
    setDraft((current) => ({
      ...current,
      [day]: current[day].map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const addRow = (day: Weekday) => {
    setDraft((current) => ({
      ...current,
      [day]: [...current[day], { startTime: "09:00", endTime: "19:00" }],
    }));
  };

  const removeRow = (day: Weekday, index: number) => {
    setDraft((current) => ({
      ...current,
      [day]: current[day].filter((_, position) => position !== index),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const invalid = WEEK.some((day) =>
      draft[day].some((row) => !row.startTime || !row.endTime || row.startTime >= row.endTime),
    );

    if (invalid) {
      setError(labels.invalid);
      return;
    }

    setError(null);
    setFormError(null);

    try {
      await onSave(draft);
    } catch (caught) {
      setFormError(apiErrorMessage(caught, dict.ui.dashboard.errorBody));
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <p className="text-xs leading-relaxed text-ink/45">{labels.hint}</p>

      <div className="flex flex-col gap-4">
        {WEEK.map((day) => (
          <div key={day} className="border-t border-navy/10 pt-4 first:border-0 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <span className={`${LABEL} text-ink/50`}>{dayName(day)}</span>
              <button
                type="button"
                onClick={() => addRow(day)}
                disabled={busy}
                className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-50"
              >
                + {labels.addSlot}
              </button>
            </div>

            {draft[day].length === 0 ? (
              <p className="mt-2 text-xs text-ink/30">{labels.closed}</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {draft[day].map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={row.startTime}
                      onChange={(event) => update(day, index, { startTime: event.target.value })}
                      aria-label={`${labels.from} — ${dayName(day)}`}
                      disabled={busy}
                      className="w-full border border-ink/15 bg-white px-3 py-2 text-sm tabular-nums text-ink outline-none focus:border-brand disabled:opacity-60"
                    />
                    <span aria-hidden className="text-xs text-ink/30">
                      →
                    </span>
                    <input
                      type="time"
                      value={row.endTime}
                      onChange={(event) => update(day, index, { endTime: event.target.value })}
                      aria-label={`${labels.to} — ${dayName(day)}`}
                      disabled={busy}
                      className="w-full border border-ink/15 bg-white px-3 py-2 text-sm tabular-nums text-ink outline-none focus:border-brand disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(day, index)}
                      disabled={busy}
                      aria-label={labels.removeSlot}
                      className="grid h-8 w-8 shrink-0 place-items-center text-ink/40 transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

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
          onClick={onCancel}
          disabled={busy}
          className="border border-ink/15 px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:border-ink/40 disabled:opacity-50"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand disabled:opacity-50"
        >
          {busy ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
