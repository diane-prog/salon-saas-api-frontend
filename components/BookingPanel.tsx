"use client";

import { useMemo, useState } from "react";
import type { AxiosError } from "axios";

import { useDictionary } from "@/components/DictionaryProvider";
import { Field } from "@/components/Form";
import { formatPrice } from "@/lib/price";
import { useCreateSalonBooking, useSalonSlots } from "@/features/public-salon/queries";
import type {
  PublicBooking,
  SalonInfo,
  SalonService,
  SalonStaffMember,
} from "@/features/public-salon/types";
import { apiErrorMessage } from "@/lib/api-error";
import { LABEL } from "@/lib/editorial";

/**
 * Réservation en ligne d'un salon — le parcours que l'accueil promet
 * (« la cliente choisit, l'agenda se remplit »), branché sur les deux seules
 * routes publiques qui écrivent :
 *
 *   1. `POST /public/{slug}/slots` — les heures réellement libres d'une journée ;
 *   2. `POST /public/{slug}/booking` — le rendez-vous, sans compte.
 *
 * Trois étapes visibles (prestation → créneau → coordonnées), une quatrième
 * pour la confirmation. Ce découpage suit le contrat : le moteur de créneaux a
 * besoin de la prestation, et la réservation a besoin du créneau choisi.
 *
 * CE QUE L'ÉCRAN REFUSE D'INVENTER, et pourquoi :
 *   - `staffId` est **obligatoire** côté API (vérifié dans `PublicBookingDto`) :
 *     pas de « peu importe » qui enverrait une valeur vide. Si l'équipe n'est pas
 *     publiée, la réservation est annoncée fermée plutôt que cassée à l'envoi ;
 *   - seules les prestations `bookableOnline` ET portant un `id` sont proposées :
 *     sans identifiant, `POST /booking` n'a rien à recevoir ;
 *   - un `409` n'est pas une erreur générique : le créneau vient d'être pris, on
 *     le dit et on renvoie choisir une heure.
 *
 * Les heures renvoyées (`HH:mm`) sont **locales au salon** : elles sont affichées
 * telles quelles, jamais converties par `new Date()`. Les jours, eux, sont
 * calculés dans le fuseau du salon (`salon.timezone`) pour que « aujourd'hui »
 * soit le même à l'écran sur le serveur et dans le navigateur.
 */

type Step = 1 | 2 | 3 | 4;

type Values = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
};

const EMPTY: Values = { firstName: "", lastName: "", phone: "", email: "", notes: "" };

/** Nombre de jours proposés à partir d'aujourd'hui. Deux semaines : assez pour choisir. */
const DAYS_AHEAD = 14;

/** Jour courant dans le fuseau du salon, au format `YYYY-MM-DD`. */
function todayIn(timeZone: string): string {
  try {
    /* `en-CA` rend directement `YYYY-MM-DD`. */
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** Décale un jour ISO de `n` jours, sans passer par le fuseau du navigateur. */
function addDays(iso: string, n: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + n)).toISOString().slice(0, 10);
}

/** Les deux morceaux d'une pastille de jour : « lun. » puis « 20 oct. ». */
function dayParts(iso: string, locale: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return {
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date),
    date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(
      date,
    ),
  };
}

/** Date complète d'un rendez-vous, pour le récapitulatif et la confirmation. */
function longDay(iso: string, locale: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export default function BookingPanel({
  slug,
  salon,
  services,
  staff,
  status,
}: {
  slug: string;
  salon: SalonInfo;
  services: readonly SalonService[];
  staff: readonly SalonStaffMember[];
  /** `loading` / `error` : les listes ne sont pas encore exploitables. */
  status: "loading" | "error" | "ready";
}) {
  const { dict, locale } = useDictionary();
  const labels = dict.storefront;
  const t = labels.booking;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";
  const primary = salon.colors.primary;

  /* Une prestation n'est proposée que si elle est publiée, réservable en ligne
     ET identifiée — les trois conditions du contrat `/booking`. */
  const bookable = useMemo(
    () => services.filter((service) => service.active && service.bookableOnline && !!service.id),
    [services],
  );
  const team = useMemo(() => staff.filter((member) => member.active && !!member.id), [staff]);

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [day, setDay] = useState(() => todayIn(salon.timezone));
  const [time, setTime] = useState("");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  /* Conflit de créneau : le message doit apparaître À L'ÉTAPE DES HEURES, là où
     l'utilisateur revient — un message posé sur le formulaire qu'il vient de
     quitter ne serait lu par personne. */
  const [slotAlert, setSlotAlert] = useState<string | null>(null);
  const [result, setResult] = useState<PublicBooking | null>(null);  /* L'équipe arrive APRÈS le premier rendu (requête client). Plutôt que de
     recopier le premier membre dans l'état via un effet — ce qui provoquerait un
     rendu en cascade — on le **dérive** : tant qu'aucun choix explicite n'existe,
     c'est le premier membre disponible qui vaut sélection. Le choix de
     l'utilisateur, lui, vit dans `staffId` et prend le dessus dès qu'il existe. */
  const chosenStaffId = staffId || team[0]?.id || "";

  /* Le jour n'est interrogé qu'à partir de l'étape 2 : une date vide désactive la
     requête (`useSalonSlots`), donc aucune requête inutile pendant l'étape 1. */
  const slots = useSalonSlots(slug, {
    date: step >= 2 ? day : "",
    serviceId: serviceId || undefined,
    staffId: chosenStaffId || undefined,
  });

  const booking = useCreateSalonBooking();

  /*
   * L'API rend la journée ENTIÈRE à plat (relevé : 93 créneaux au pas de 15 min,
   * dont la quasi-totalité indisponibles). Afficher les indisponibles barrés
   * ferait un mur de boutons illisibles ; on ne propose donc que les heures
   * réellement libres, et s'il n'y en a aucune on le dit. Aucun créneau n'est
   * inventé ni masqué autrement : `available` vient du serveur.
   */
  const freeSlots = (slots.data ?? []).filter((slot) => slot.available);

  const service = bookable.find((item) => item.id === serviceId);
  const bookingDays = useMemo(() => {
    const today = todayIn(salon.timezone);
    return Array.from({ length: DAYS_AHEAD }, (_, index) => addDays(today, index));
  }, [salon.timezone]);

  const money = (amount: number | string) => formatPrice(amount, labels.priceCurrency, intlLocale);

  const reset = () => {
    setStep(1);
    setServiceId("");
    setTime("");
    setValues(EMPTY);
    setErrors({});
    setFormError(null);
    setSlotAlert(null);
    setResult(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (!values.firstName.trim()) found.firstName = t.required;
    if (!values.lastName.trim()) found.lastName = t.required;
    if (!values.phone.trim() || values.phone.replace(/\D/g, "").length < 6) {
      found.phone = t.invalidPhone;
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      found.email = t.invalidEmail;
    }

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    if (!service?.id || !chosenStaffId || !time) return;

    setErrors({});
    setFormError(null);
    setSlotAlert(null);

    try {
      const created = await booking.mutateAsync({
        slug,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        notes: values.notes.trim() || undefined,
        serviceId: service.id,
        staffId: chosenStaffId,
        /* Le Swagger attend une date ISO : le jour, à minuit UTC. */
        date: `${day}T00:00:00.000Z`,
        startTime: time,
      });

      setResult(created);
      setStep(4);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;

      if (status === 409) {
        /* Le créneau a été pris entre l'affichage et l'envoi : on ne renvoie pas
           l'utilisateur à l'étape précédente avec un message vague. */
        setSlotAlert(t.slotTaken);
        setTime("");
        setStep(2);
        return;
      }

      setFormError(apiErrorMessage(error, t.error));
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-ink/50">{labels.loading}</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-ink/60">{labels.unavailableBody}</p>;
  }

  if (!bookable.length) {
    return <p className="text-sm text-ink/60">{labels.servicesEmpty}</p>;
  }

  if (!team.length) {
    return <p className="text-sm text-ink/60">{t.noStaff}</p>;
  }

  const stepLabels: Record<1 | 2 | 3, string> = {
    1: t.steps.service,
    2: t.steps.slot,
    3: t.steps.details,
  };

  return (
    <div>
      {/* ——— Fil des étapes : on peut revenir en arrière, jamais sauter en avant. */}
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {([1, 2, 3] as const).map((number) => {
          const current = step === number;
          const done = step > number;

          return (
            <li key={number} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => done && setStep(number)}
                disabled={!done}
                aria-current={current ? "step" : undefined}
                className={`flex items-center gap-2 text-xs transition-opacity ${
                  current ? "text-ink" : done ? "text-ink/60 hover:text-ink" : "text-ink/30"
                }`}
              >
                <span
                  aria-hidden
                  className="grid h-6 w-6 place-items-center rounded-full border border-ink/15 text-[0.65rem] tabular-nums"
                  style={current || done ? { background: primary, borderColor: primary, color: "#fff" } : undefined}
                >
                  {number}
                </span>
                <span className={LABEL}>{stepLabels[number]}</span>
              </button>
              {number < 3 && <span aria-hidden className="h-px w-6 bg-ink/15" />}
            </li>
          );
        })}
      </ol>

      {/* ——— Étape 1 : la prestation. */}
      {step === 1 && (
        <div className="mt-7">
          <h3 className="font-light text-xl text-ink">{t.chooseService}</h3>

          <ul className="mt-4 grid gap-px bg-ink/10 sm:grid-cols-2">
            {bookable.map((item) => {
              const selected = item.id === serviceId;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceId(item.id ?? "");
                      setTime("");
                      setSlotAlert(null);
                    }}
                    aria-pressed={selected}
                    className={`flex h-full w-full flex-col gap-2 p-5 text-left transition-colors ${
                      selected ? "bg-white" : "bg-paper hover:bg-white"
                    }`}
                    style={selected ? { boxShadow: `inset 0 0 0 1px ${primary}` } : undefined}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-ink">{item.name}</span>
                      <span className="shrink-0 text-sm tabular-nums text-ink/60">
                        {money(item.price)}
                      </span>
                    </span>

                    <span className="text-xs text-ink/45">
                      {item.category && <>{item.category} · </>}
                      {item.durationMinutes} {t.min ?? "min"}
                    </span>

                    {item.description && (
                      <span className="text-xs leading-relaxed text-ink/50">{item.description}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!serviceId}
              onClick={() => setStep(2)}
              className="rounded-full px-6 py-3 text-sm font-light text-white transition-opacity disabled:opacity-40"
              style={{ background: primary }}
            >
              {t.next}
            </button>
          </div>
        </div>
      )}

      {/* ——— Étape 2 : l'équipe, le jour, l'heure. */}
      {step === 2 && (
        <div className="mt-7 flex flex-col gap-7">
          {team.length > 1 && (
            <div>
              <span className={`${LABEL} text-ink/40`}>{t.chooseStaff}</span>
              <ul className="mt-3 flex flex-wrap gap-2">
                {team.map((member) => {
                  const selected = member.id === chosenStaffId;

                  return (
                    <li key={member.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffId(member.id ?? "");
                          setTime("");
                          setSlotAlert(null);
                        }}
                        aria-pressed={selected}
                        className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                          selected
                            ? "border-transparent text-white"
                            : "border-ink/15 text-ink/70 hover:border-ink/30"
                        }`}
                        style={selected ? { background: primary } : undefined}
                      >
                        {member.firstName} {member.lastName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <span className={`${LABEL} text-ink/40`}>{t.chooseDay}</span>

            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
              {bookingDays.map((iso) => {
                const selected = iso === day;
                const parts = dayParts(iso, intlLocale);

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => {
                      setDay(iso);
                      setTime("");
                      setSlotAlert(null);
                    }}
                    aria-pressed={selected}
                    aria-label={longDay(iso, intlLocale)}
                    className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-colors ${
                      selected
                        ? "border-transparent text-white"
                        : "border-ink/10 bg-paper text-ink/70 hover:border-ink/25"
                    }`}
                    style={selected ? { background: primary } : undefined}
                  >
                    <span className="text-[0.65rem] uppercase tracking-[0.12em] opacity-70">
                      {parts.weekday}
                    </span>
                    <span className="text-sm tabular-nums">{parts.date}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={`${LABEL} text-ink/40`}>{t.chooseTime}</span>

            <div className="mt-3" aria-live="polite">
              {slotAlert && (
                <p
                  role="alert"
                  className="mb-4 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
                >
                  {slotAlert}
                </p>
              )}

              {slots.isPending && <p className="text-sm text-ink/50">{t.slotsLoading}</p>}

              {slots.isError && (
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-ink/60">{t.slotsError}</p>
                  <button
                    type="button"
                    onClick={() => slots.refetch()}
                    className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/70 transition-colors hover:border-ink/35"
                  >
                    {labels.retry}
                  </button>
                </div>
              )}

              {slots.isSuccess && freeSlots.length === 0 && (
                <p className="text-sm text-ink/60">{t.noSlots}</p>
              )}

              {freeSlots.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {freeSlots.map((slot) => {
                    const selected = slot.startTime === time;

                    return (
                      <li key={slot.startTime}>
                        <button
                          type="button"
                          onClick={() => {
                            setTime(slot.startTime);
                            setSlotAlert(null);
                          }}
                          aria-pressed={selected}
                          className={`rounded-lg border px-4 py-2 text-sm tabular-nums transition-colors ${
                            selected
                              ? "border-transparent text-white"
                              : "border-ink/15 text-ink hover:border-ink/35"
                          }`}
                          style={selected ? { background: primary } : undefined}
                        >
                          {slot.startTime}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {t.back}
            </button>

            <button
              type="button"
              disabled={!time}
              onClick={() => setStep(3)}
              className="rounded-full px-6 py-3 text-sm font-light text-white transition-opacity disabled:opacity-40"
              style={{ background: primary }}
            >
              {t.next}
            </button>
          </div>
        </div>
      )}

      {/* ——— Étape 3 : les coordonnées, puis l'envoi. */}
      {step === 3 && service && (
        <form noValidate onSubmit={submit} className="mt-7 flex flex-col gap-6">
          <div className={`border-l-2 pl-4 ${LABEL} text-ink/45`} style={{ borderColor: primary }}>
            {service.name} · {longDay(day, intlLocale)} {t.at} {time}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.fields.firstName}
              name="firstName"
              required
              autoComplete="given-name"
              value={values.firstName}
              onChange={(firstName) => setValues((current) => ({ ...current, firstName }))}
              error={errors.firstName}
              disabled={booking.isPending}
            />
            <Field
              label={t.fields.lastName}
              name="lastName"
              required
              autoComplete="family-name"
              value={values.lastName}
              onChange={(lastName) => setValues((current) => ({ ...current, lastName }))}
              error={errors.lastName}
              disabled={booking.isPending}
            />
            <Field
              label={t.fields.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              value={values.phone}
              onChange={(phone) => setValues((current) => ({ ...current, phone }))}
              error={errors.phone}
              hint={t.phoneHint}
              disabled={booking.isPending}
            />
            <Field
              label={t.fields.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={(email) => setValues((current) => ({ ...current, email }))}
              error={errors.email}
              disabled={booking.isPending}
            />
            <div className="sm:col-span-2">
              <Field
                label={t.fields.notes}
                name="notes"
                placeholder={t.fields.notesPlaceholder}
                value={values.notes}
                onChange={(notes) => setValues((current) => ({ ...current, notes }))}
                disabled={booking.isPending}
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs leading-relaxed text-destructive"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {t.back}
            </button>

            <button
              type="submit"
              disabled={booking.isPending}
              className="rounded-full px-6 py-3 text-sm font-light text-white transition-opacity disabled:opacity-60"
              style={{ background: primary }}
            >
              {booking.isPending ? t.sending : t.confirm}
            </button>
          </div>
        </form>
      )}

      {/* ——— Confirmation : ce que le serveur a réellement enregistré. */}
      {step === 4 && (
        <div className="mt-7 border-t border-ink/10 pt-7" aria-live="polite">
          <h3 className="font-light text-2xl text-ink">{t.successTitle}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">{t.successBody}</p>

          <dl className="mt-6 grid gap-px bg-ink/10 sm:grid-cols-3">
            <div className="bg-paper p-4">
              <dt className={`${LABEL} text-ink/40`}>{t.steps.service}</dt>
              <dd className="mt-2 text-sm text-ink">{service?.name}</dd>
            </div>
            <div className="bg-paper p-4">
              <dt className={`${LABEL} text-ink/40`}>{t.steps.slot}</dt>
              <dd className="mt-2 text-sm text-ink tabular-nums">
                {longDay(day, intlLocale)} · {result?.startTime ?? time}
              </dd>
            </div>
            <div className="bg-paper p-4">
              <dt className={`${LABEL} text-ink/40`}>{t.summary}</dt>
              <dd className="mt-2 text-sm text-ink">
                {values.firstName} {values.lastName}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full border border-ink/15 px-5 py-2.5 text-xs text-ink/70 transition-colors hover:border-ink/35"
          >
            {t.newBooking}
          </button>
        </div>
      )}
    </div>
  );
}
