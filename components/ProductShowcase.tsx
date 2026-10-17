"use client";

import Link from "next/link";

import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import {
  useSalonGallery,
  useSalonInfo,
  useSalonReviews,
  useSalonServices,
  useSalonStaff,
} from "@/features/public-salon/queries";

/**
 * « Le produit en vrai » — la page qui remplace les études de cas d'agence.
 *
 * POURQUOI CE CHOIX : un salon n'achète pas un portfolio, il achète la
 * promesse que sa journée tiendra. La seule preuve honnête est donc le produit
 * lui-même, alimenté par l'API réelle du salon de démonstration : ses
 * prestations avec leurs durées et leurs prix, son équipe, ses photos, ses avis
 * publiés. Rien n'est dessiné, rien n'est écrit à la main — quand l'API ne
 * répond pas, la page le dit au lieu de montrer une maquette.
 *
 * Le lien final ouvre la vitrine publique : c'est la page qu'une cliente voit,
 * et c'est la meilleure démonstration de ce que le logiciel produit.
 */
const SLUG = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG ?? "";

export function ProductShowcase() {
  const { dict, locale } = useDictionary();
  const t = dict.showcase;

  const info = useSalonInfo(SLUG);
  const services = useSalonServices(SLUG);
  const staff = useSalonStaff(SLUG);
  const gallery = useSalonGallery(SLUG);
  const reviews = useSalonReviews(SLUG);

  const salon = info.data?.data;
  const serviceList = services.data?.data ?? [];
  const team = (staff.data?.data ?? []).filter((member) => member.active);
  const photos = gallery.data?.data ?? [];
  const reviewData = reviews.data?.data;

  const loading = services.isPending || staff.isPending;
  const failed = services.isError || staff.isError;

  return (
    <div className="flex flex-col">
      {/* ——— Le salon tel qu'il se présente. */}
      <section className="border-t border-ink/10 bg-ink text-paper">
        <div className="container-x flex flex-wrap items-end justify-between gap-6 py-10">
          <div>
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-turquoise">
              {t.demoLabel}
            </span>
            <p className="mt-3 font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-none">
              {salon?.name ?? dict.ui.dashboard.loading}
            </p>
            <p className="mt-2 text-xs text-paper/45">
              {[salon?.city, salon?.country].filter(Boolean).join(" · ") || t.demoPlace}
            </p>
          </div>

          {salon?.publicBooking && (
            <Link
              href={`/${locale}/s/${SLUG}`}
              className="group inline-flex items-center gap-2 border border-paper/25 px-5 py-3 text-[0.66rem] uppercase tracking-[0.16em] text-paper/80 transition-colors hover:border-turquoise hover:text-turquoise"
            >
              {t.openSalon}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </section>

      {/* ——— Prestations réelles. */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="container-x grid gap-8 py-14 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl leading-tight text-ink">{t.servicesTitle}</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/55">{t.servicesBody}</p>
          </div>

          <div className="lg:col-span-8">
            {loading && <p className="text-sm text-ink/40">…</p>}
            {failed && <p className="text-sm text-ink/50">{t.unavailable}</p>}

            {!loading && !failed && serviceList.length === 0 && (
              <p className="text-sm text-ink/50">{t.empty}</p>
            )}

            {serviceList.length > 0 && (
              <ul className="border-t border-ink/15">
                {serviceList.map((service) => (
                  <li
                    key={service.id ?? service.name}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-ink/10 py-4"
                  >
                    <span>
                      <span className="block text-sm text-ink">{service.name}</span>
                      <span className="mt-1 block text-xs text-ink/45">
                        {service.category ? `${service.category} · ` : ""}
                        {service.durationMinutes} min
                      </span>
                    </span>
                    <span className="font-display text-lg tabular-nums text-ink">
                      {service.price} €
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ——— Équipe réelle. */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="container-x grid gap-8 py-14 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl leading-tight text-ink">{t.teamTitle}</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/55">{t.teamBody}</p>
          </div>

          <ul className="grid gap-px bg-ink/15 lg:col-span-8 sm:grid-cols-2">
            {team.map((member) => (
              <li key={member.id ?? `${member.firstName}-${member.lastName}`} className="bg-paper p-5">
                <p className="font-display text-lg leading-tight text-ink">
                  {member.firstName} {member.lastName}
                </p>
                {member.title && <p className="mt-1 text-xs text-ink/45">{member.title}</p>}
                {member.specialties && member.specialties.length > 0 && (
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink/40">
                    {member.specialties.join(" · ")}
                  </p>
                )}
              </li>
            ))}

            {!loading && !failed && team.length === 0 && (
              <li className="bg-paper p-5 text-sm text-ink/50">{t.empty}</li>
            )}
          </ul>
        </div>
      </section>

      {/* ——— Photos publiées par le salon. */}
      {photos.length > 0 && (
        <section className="border-t border-ink/10 bg-paper">
          <div className="container-x py-14 sm:py-20">
            <h2 className="font-display text-2xl leading-tight text-ink">{t.galleryTitle}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">{t.galleryBody}</p>

            <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {photos.slice(0, 8).map((photo) => (
                <li key={photo.publicId} className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- photo de la galerie du salon, hors liste blanche connue à la compilation */}
                  <img
                    src={photo.secureUrl}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ——— Avis publiés. */}
      {reviewData && reviewData.reviews.length > 0 && (
        <section className="border-t border-ink/10 bg-paper">
          <div className="container-x grid gap-8 py-14 sm:py-20 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl leading-tight text-ink">{t.reviewsTitle}</h2>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none tabular-nums text-ink">
                  {reviewData.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-ink/45">
                  /5 · {reviewData.reviews.length} {dict.storefront.reviewsCount}
                </span>
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/55">{t.reviewsBody}</p>
            </div>

            <ul className="grid gap-px bg-ink/15 lg:col-span-8 sm:grid-cols-2">
              {reviewData.reviews.slice(0, 4).map((review) => (
                <li key={review.id} className="flex flex-col gap-3 bg-paper p-5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-ink">{review.customerName}</span>
                    <span className="font-display text-sm tabular-nums text-brand">
                      {review.rating}/5
                    </span>
                  </span>
                  {review.comment && (
                    <p className="text-sm leading-relaxed text-ink/60">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
