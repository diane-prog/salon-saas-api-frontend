"use client";

import Link from "next/link";

import BookingPanel from "@/components/BookingPanel";
import { useDictionary } from "@/components/DictionaryProvider";
import SalonContactForm from "@/components/SalonContactForm";
import SalonReviewForm from "@/components/SalonReviewForm";
import {
  useSalonGallery,
  useSalonReviews,
  useSalonServices,
  useSalonStaff,
} from "@/features/public-salon/queries";
import { formatPrice } from "@/lib/price";
import type { SalonInfo } from "@/features/public-salon/types";
import { BODY, LABEL } from "@/lib/editorial";

/**
 * La vitrine publique d'un salon — `/[lang]/s/[slug]`.
 *
 * C'est la pièce que le site marketing promet partout (« chaque salon a sa page,
 * à ses couleurs ») : ici, elle existe, et elle est faite des réponses réelles de
 * l'API publique du salon — identité, prestations, équipe, galerie, avis,
 * créneaux. Aucune valeur d'exemple, aucun texte de remplissage : quand une
 * section n'a rien à montrer, elle le dit (« rien n'est encore publié »), et
 * quand l'API ne répond pas, elle le dit aussi.
 *
 * L'identité du salon est reçue en propriété : elle a déjà été lue côté serveur
 * (`features/public-salon/server.ts`), ce qui permet à la route de répondre un
 * vrai 404 et d'annoncer le vrai nom dans les métadonnées. Les autres listes
 * arrivent après hydratation, par les hooks de la feature — mêmes clés de cache
 * que la landing.
 *
 * Les COULEURS du salon sont posées en variables CSS sur la racine et employées
 * telles quelles : c'est la promesse « aux couleurs de ce salon ». Le texte des
 * boutons reste blanc, comme sur l'accueil où la couleur primaire sert déjà de
 * fond — un seul choix, tenu aux deux endroits.
 */
export default function SalonPage({ slug, salon }: { slug: string; salon: SalonInfo }) {
  const { dict, locale } = useDictionary();
  const labels = dict.storefront;
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";

  const servicesQ = useSalonServices(slug);
  const staffQ = useSalonStaff(slug);
  const galleryQ = useSalonGallery(slug);
  const reviewsQ = useSalonReviews(slug);

  const services = servicesQ.data?.data ?? [];
  const team = staffQ.data?.data ?? [];
  const gallery = galleryQ.data?.data ?? [];
  const reviews = reviewsQ.data?.data;

  const bookingStatus =
    servicesQ.isPending || staffQ.isPending
      ? "loading"
      : servicesQ.isError || staffQ.isError
        ? "error"
        : "ready";

  const primary = salon.colors.primary;
  const accent = salon.colors.accent;
  const secondary = salon.colors.secondary;
  const place = [salon.city, salon.country].filter(Boolean).join(", ");
  const heroImage = gallery[0]?.secureUrl;

  const bookLink = salon.publicBooking ? (
    <a
      href="#reservation"
      className="shrink-0 rounded-full px-5 py-2.5 text-xs font-medium transition-transform duration-300 hover:-translate-y-0.5"
      style={{ background: primary, color: "#fff" }}
    >
      {labels.book}
    </a>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* ——— En-tête : la marque du salon, pas celle de Belora. */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="container-x flex items-center justify-between gap-4 py-3.5">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {salon.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL fournie par le salon (Cloudinary), hors liste blanche connue à la compilation
              <img
                src={salon.logo}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.7rem] tracking-wide text-white"
                style={{ background: primary }}
              >
                {initials(salon.name)}
              </span>
            )}

            <span className="min-w-0">
              <span className="block truncate font-light text-base leading-tight">{salon.name}</span>
              {place && <span className="block truncate text-[0.7rem] text-ink/50">{place}</span>}
            </span>
          </a>

          {bookLink}
        </div>
      </header>

      <main className="flex-1">
        {/* ——— Hero : les couleurs du salon, en plein cadre. */}
        <section id="top" className="relative overflow-hidden" style={{ background: primary }}>
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element -- photo de la galerie du salon, même raison que le logo
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}

          <div className="container-x relative py-16 text-white sm:py-24">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.22em] opacity-70">
              {labels.breadcrumb}
            </span>

            <h1 className="mt-4 max-w-3xl font-light text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
              {salon.name}
            </h1>

            {salon.description && (
              <p className="mt-5 max-w-xl text-[1rem] leading-relaxed opacity-85">
                {salon.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs opacity-80">
              {place && <span>{place}</span>}
              {reviews && reviews.reviews.length > 0 && (
                <span className="tabular-nums">
                  {reviews.averageRating.toFixed(1)}/5 · {reviews.reviews.length}{" "}
                  {labels.reviewsCount}
                </span>
              )}
              {/* Quand la réservation est ouverte, le bouton juste en dessous le dit
                  déjà : le répéter ici n'apprendrait rien. */}
              {!salon.publicBooking && <span>{labels.bookingClosed}</span>}
            </div>

            {salon.publicBooking && (
              <a
                href="#reservation"
                className="mt-8 inline-flex rounded-full px-6 py-3.5 text-sm font-light transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: secondary, color: primary }}
              >
                {labels.bookOnline}
              </a>
            )}
          </div>
        </section>

        {/* ——— Prestations. */}
        <Section label={labels.sections.services} note={labels.servicesIntro}>
          {servicesQ.isPending && <Pending />}

          {servicesQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}

          {servicesQ.isSuccess && services.length === 0 && (
            <p className={`${BODY} text-ink/60`}>{labels.servicesEmpty}</p>
          )}

          {services.length > 0 && (
            <ul className="grid gap-px bg-ink/10 sm:grid-cols-2">
              {services.map((service) => (
                <li
                  key={service.id ?? service.name}
                  className="flex flex-col gap-2 bg-paper p-5 sm:p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-ink">{service.name}</span>
                    <span className="shrink-0 text-sm tabular-nums" style={{ color: primary }}>
                      {formatPrice(service.price, labels.priceCurrency, intlLocale)}
                    </span>
                  </div>

                  <span className="text-xs text-ink/45">
                    {service.category && <>{service.category} · </>}
                    {service.durationMinutes} min
                  </span>

                  {service.description && (
                    <p className="text-xs leading-relaxed text-ink/55">{service.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ——— Équipe. */}
        <Section label={labels.sections.team}>
          {staffQ.isPending && <Pending />}

          {staffQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}

          {staffQ.isSuccess && team.length === 0 && (
            <p className={`${BODY} text-ink/60`}>{labels.teamEmpty}</p>
          )}

          {team.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li
                  key={member.id ?? `${member.firstName}-${member.lastName}`}
                  className="flex gap-4 border border-ink/10 p-5"
                >
                  {member.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar fourni par le salon
                    <img
                      src={member.avatar}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-xs text-white"
                      style={{ background: accent }}
                    >
                      {initials(`${member.firstName} ${member.lastName}`)}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">
                      {member.firstName} {member.lastName}
                    </p>
                    {member.title && <p className="text-xs text-ink/50">{member.title}</p>}
                    {member.bio && (
                      <p className="mt-2 text-xs leading-relaxed text-ink/55">{member.bio}</p>
                    )}
                    {member.specialties && member.specialties.length > 0 && (
                      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">
                        {member.specialties.join(" · ")}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ——— Galerie. */}
        <Section label={labels.sections.gallery}>
          {galleryQ.isPending && <Pending />}

          {galleryQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}

          {galleryQ.isSuccess && gallery.length === 0 && (
            <p className={`${BODY} text-ink/60`}>{labels.galleryEmpty}</p>
          )}

          {gallery.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((image) => (
                <li key={image.publicId} className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- image de la galerie du salon */}
                  <img
                    src={image.secureUrl}
                    alt={image.caption ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ——— Avis. */}
        <Section label={labels.sections.reviews} note={labels.reviewsNote}>
          {reviewsQ.isPending && <Pending />}

          {reviewsQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}

          {reviews && reviews.reviews.length === 0 && (
            <p className={`${BODY} text-ink/60`}>{labels.reviewsEmpty}</p>
          )}

          {reviews && reviews.reviews.length > 0 && (
            <div className="mb-10 flex flex-col gap-8">
              <div className="flex items-baseline gap-3">
                <span className="font-light text-5xl leading-none tabular-nums" style={{ color: primary }}>
                  {reviews.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-ink/50">
                  /5 · {reviews.averageRating ? labels.average : ""} · {reviews.reviews.length}{" "}
                  {labels.reviewsCount}
                </span>
              </div>

              <ul className="grid gap-px bg-ink/10 sm:grid-cols-2">
                {reviews.reviews.map((review) => (
                  <li key={review.id} className="flex flex-col gap-3 bg-paper p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink">{review.customerName}</span>
                      <span className="flex items-center gap-1.5" aria-label={`${review.rating}/5`}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            aria-hidden
                            className={`h-1.5 w-1.5 rounded-full ${dot <= Math.round(review.rating) ? "" : "opacity-20"}`}
                            style={{ background: accent }}
                          />
                        ))}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm leading-relaxed text-ink/65">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SalonReviewForm slug={slug} primary={primary} accent={accent} />
        </Section>

        {/* ——— Réservation : le seul endroit qui écrit. */}
        <section id="reservation" className="border-t border-ink/10 bg-white">
          <div className="container-x grid gap-10 py-16 lg:grid-cols-12 sm:py-20">
            <div className="lg:col-span-4">
              <span className={`${LABEL} text-ink/40`}>{labels.sections.booking}</span>
              <h2 className="mt-4 font-light text-3xl leading-tight tracking-tight text-ink">
                {labels.booking.title}
              </h2>
              <p className={`mt-4 max-w-sm ${BODY} text-ink/60`}>{labels.booking.lead}</p>

              {!salon.publicBooking && (
                <p className={`mt-6 border-l-2 pl-4 ${BODY} text-ink/60`} style={{ borderColor: primary }}>
                  {labels.bookingClosed}
                </p>
              )}
            </div>

            <div className="lg:col-span-8">
              {salon.publicBooking ? (
                <BookingPanel
                  slug={slug}
                  salon={salon}
                  services={services}
                  staff={team}
                  status={bookingStatus}
                />
              ) : (
                <p className={`${BODY} text-ink/50`}>{labels.bookOnline}</p>
              )}
            </div>
          </div>
        </section>

        {/* ——— Contact : écrire au salon, sans passer par une réservation. */}
        <Section label={labels.sections.contact} note={labels.contact.lead}>
          <SalonContactForm slug={slug} primary={primary} />
        </Section>
      </main>

      {/* ——— Pied de page : le salon, puis la plateforme qui l'héberge. */}
      <footer className="border-t border-ink/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-7 text-xs text-ink/45">
          <span>
            {salon.name}
            {place && <> · {place}</>}
          </span>

          <span>
            {labels.poweredBy}{" "}
            <Link href={`/${locale}`} className="text-ink underline-offset-4 hover:underline">
              {dict.site.name}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Une section de la vitrine : une étiquette, une note facultative, du contenu. */
function Section({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink/10">
      <div className="container-x py-14 sm:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className={`${LABEL} text-ink/40`}>{label}</h2>
          {note && <p className="text-xs text-ink/40">{note}</p>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

/** Chargement d'une section : une ligne, jamais un faux contenu. */
function Pending() {
  return <p aria-hidden className="text-sm text-ink/30">…</p>;
}

/** Deux initiales, pour une marque sans logo. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
