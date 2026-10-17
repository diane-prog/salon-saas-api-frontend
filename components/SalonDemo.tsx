"use client";

import Link from "next/link";

import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL, RULE } from "@/lib/editorial";
import { useSalonInfo, useSalonReviews, useSalonServices, useSalonStaff } from "@/features/public-salon/queries";
import type { SalonColors } from "@/features/public-salon/types";

/**
 * Section « en direct » de l'accueil (`#demo`).
 *
 * Ce qu'elle démontre, et pourquoi c'est la pièce la plus importante de la page :
 * le produit rend la vitrine d'un salon AUX COULEURS DE CE SALON. La maquette à
 * droite n'est pas une image — c'est la vraie réponse de l'API du salon de
 * démonstration (nom, couleurs, prestations, équipe, note, état de la
 * réservation), posée dans le vrai composant de la vitrine.
 *
 * On ne montre donc pas ce que le logiciel *pourrait* faire : on montre ce
 * qu'il vient de faire, pendant que la page s'affiche.
 *
 * Trois états : chargement (le cadre et son titre, sans donnée), échec (une
 * phrase honnête, jamais des valeurs d'exemple), réponse (le salon). Les
 * requêtes sont les mêmes que `LiveStats`, donc partagées par le cache : un
 * seul aller-retour par ressource pour toute la page.
 */
const SLUG = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG ?? "";

/** Variables CSS posées sur la maquette : ce sont celles du salon, pas les nôtres. */
function salonTheme(colors: SalonColors): React.CSSProperties {
  return {
    ["--salon-primary" as string]: colors.primary,
    ["--salon-secondary" as string]: colors.secondary,
    ["--salon-accent" as string]: colors.accent,
  };
}

export default function SalonDemo() {
  const { dict, locale } = useDictionary();
  const { demo } = dict.ui;

  const info = useSalonInfo(SLUG);
  const services = useSalonServices(SLUG);
  const staff = useSalonStaff(SLUG);
  const reviews = useSalonReviews(SLUG);

  const loading = [info, services, staff, reviews].some((query) => query.isPending);
  const failed = [info, services, staff, reviews].some((query) => query.isError);

  const salon = info.data?.data;
  const serviceList = services.data?.data ?? [];
  const teamList = staff.data?.data ?? [];
  const reviewData = reviews.data?.data;

  return (
    <section id="demo" className={`border-t bg-white ${RULE}`}>
      <div className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        {/* ——— Colonne de gauche : le texte. */}
        <div className="flex flex-col justify-center gap-5 lg:col-span-5">
          <span className={`${LABEL} text-brand`}>{demo.eyebrow}</span>

          <h2 className="max-w-lg font-display text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.05] tracking-[-0.015em] text-ink">
            {demo.title}
          </h2>

          <p className={`max-w-md ${BODY} text-ink/70`}>{demo.body}</p>

          <dl className="mt-4 grid gap-px bg-ink/10 sm:grid-cols-3">
            <Stat label={demo.servicesLabel} value={serviceList.length} pending={loading} failed={failed} />
            <Stat label={demo.teamLabel} value={teamList.length} pending={loading} failed={failed} />
            <Stat
              label={demo.ratingLabel}
              value={reviewData?.averageRating ?? 0}
              suffix="/5"
              pending={loading}
              failed={failed}
            />
          </dl>

          <Link
            href={`/${locale}/register`}
            className="group mt-3 inline-flex w-fit items-center gap-2 bg-ink px-6 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
          >
            {demo.cta}
          </Link>
        </div>

        {/* ——— Colonne de droite : la vitrine, avec les couleurs du salon. */}
        <div className="lg:col-span-7">
          <div
            className="overflow-hidden border border-ink/15"
            style={salon ? salonTheme(salon.colors) : undefined}
          >
            {/* En-tête peint avec la couleur primaire du salon. */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-white"
              style={{ background: salon ? salon.colors.primary : "#0f172a" }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] opacity-70">
                  {demo.eyebrow}
                </span>
                <span className="font-light text-xl leading-tight">
                  {failed ? demo.unavailable : (salon?.name ?? "…")}
                </span>
              </div>

              <span
                className="rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em]"
                style={{
                  background: salon ? salon.colors.secondary : "#d4af37",
                  color: salon?.colors.primary ?? "#0f172a",
                }}
              >
                {salon?.publicBooking ? demo.bookingOpen : demo.bookingClosed}
              </span>
            </div>

            <div className="grid gap-6 bg-white p-6 sm:grid-cols-2 sm:p-7">
              {/* Prestations : nom, durée, prix — réels. */}
              <div>
                <span className={`${LABEL} text-ink/40`}>{demo.servicesLabel}</span>

                <ul className="mt-3">
                  {loading && <li className="py-3 text-sm text-ink/40">{dict.ui.dashboard.loading}</li>}

                  {!loading && failed && (
                    <li className="py-3 text-sm text-ink/50">{demo.unavailable}</li>
                  )}

                  {!loading && !failed && serviceList.length === 0 && (
                    <li className="py-3 text-sm text-ink/50">{demo.empty}</li>
                  )}

                  {serviceList.map((service) => (
                    <li
                      key={service.name}
                      className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 text-sm"
                    >
                      <span className="text-ink">{service.name}</span>
                      <span className="shrink-0 tabular-nums text-ink/50">
                        {service.durationMinutes} {demo.min}
                        <span className="mx-2 text-ink/20">·</span>
                        <span
                          className="font-medium"
                          style={{ color: salon?.colors.primary ?? undefined }}
                        >
                          {service.price} €
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Équipe et note : réels. */}
              <div className="flex flex-col gap-5">
                <div>
                  <span className={`${LABEL} text-ink/40`}>{demo.teamLabel}</span>
                  <ul className="mt-3">
                    {teamList.map((member) => (
                      <li
                        key={`${member.firstName}-${member.lastName}`}
                        className="flex items-center gap-3 border-b border-ink/10 py-3 text-sm text-ink"
                      >
                        <span
                          aria-hidden
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.7rem] text-white"
                          style={{ background: salon?.colors.accent ?? "#10b981" }}
                        >
                          {member.firstName.slice(0, 1)}
                          {member.lastName.slice(0, 1)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">
                            {member.firstName} {member.lastName}
                          </span>
                          {member.title && (
                            <span className="block truncate text-xs text-ink/50">{member.title}</span>
                          )}
                        </span>
                      </li>
                    ))}

                    {!loading && !failed && teamList.length === 0 && (
                      <li className="py-3 text-sm text-ink/50">{demo.empty}</li>
                    )}
                  </ul>
                </div>

                <div className="border-t border-ink/10 pt-4">
                  <span className={`${LABEL} text-ink/40`}>{demo.ratingLabel}</span>
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="font-light text-3xl leading-none tabular-nums text-ink">
                      {(reviewData?.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-ink/50">
                      /5 · {reviewData?.reviews.length ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Un chiffre de la colonne de gauche, avec ses trois états. */
function Stat({
  label,
  value,
  suffix = "",
  pending,
  failed,
}: {
  label: string;
  value: number;
  suffix?: string;
  pending: boolean;
  failed: boolean;
}) {
  return (
    <div className="bg-paper px-5 py-4">
      <dt className={`${LABEL} text-ink/40`}>{label}</dt>
      <dd className="mt-2 font-light text-2xl leading-none tabular-nums text-ink">
        {pending || failed ? "—" : value}
        {!pending && !failed && suffix}
      </dd>
    </div>
  );
}
