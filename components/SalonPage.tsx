"use client";

import Link from "next/link";
import { useState } from "react";

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
import type { SalonGalleryImage, SalonInfo } from "@/features/public-salon/types";
import { BODY, LABEL } from "@/lib/editorial";

/**
 * La vitrine publique d'un salon — `/[lang]/s/[slug]`.
 *
 * C'est la page qu'une cliente voit : elle doit tenir comme un vrai site de salon, pas
 * comme une fiche produit. Elle est donc composée en quatre temps, tous ancrés dans
 * l'en-tête collant (qui joue le rôle d'un menu) :
 *
 *   1. un HERO plein cadre aux couleurs du salon, nom en très grand, méta (ville, note,
 *      état de la réservation) et deux sorties — réserver, voir les prestations ;
 *   2. les PRESTATIONS en liste éditoriale numérotée, filtrables par catégorie, le prix
 *      aligné à droite sur un filet ;
 *   3. l'ÉQUIPE en portraits, la GALERIE en mosaïque (une grande image, puis des
 *      formats variés), les AVIS avec la moyenne en très grand ;
 *   4. la RÉSERVATION (le seul endroit qui écrit) et le CONTACT.
 *
 * Les couleurs viennent du salon et sont posées en ligne, jamais en dur : le nom, les
 * boutons, les filets d'accent et le fond de la tuile d'équipe portent sa marque.
 *
 * Aucune valeur d'exemple : quand une liste est vide ou muette, la section le dit.
 * Aucun arrondi sur les actions — le site n'en a nulle part.
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

  /* Les canaux que le salon a publiés — seulement ceux qui existent. Un salon qui n'a
     rempli aucun profil ne montre pas de liste vide, il montre le formulaire seul. */
  const channels = [
    salon.social.whatsapp ? { label: "WhatsApp", href: salon.social.whatsapp } : null,
    salon.social.instagram ? { label: "Instagram", href: salon.social.instagram } : null,
    salon.social.facebook ? { label: "Facebook", href: salon.social.facebook } : null,
    salon.social.website ? { label: labels.website, href: salon.social.website } : null,
  ].filter((channel): channel is { label: string; href: string } => channel !== null);

  /* Le filtre des prestations : les catégories publiées par le salon, rien d'autre. */
  const categories: string[] = [];
  for (const service of services) {
    if (service.category && !categories.includes(service.category)) categories.push(service.category);
  }

  const [category, setCategory] = useState<string | null>(null);
  const visibleServices = category
    ? services.filter((service) => service.category === category)
    : services;

  const bookHref = "#reservation";

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* ————————————————————————————————— En-tête : la marque du salon, et son menu. */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="container-x flex items-center justify-between gap-6 py-3.5">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {salon.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL fournie par le salon (Cloudinary), hors liste blanche connue à la compilation
              <img src={salon.logo} alt="" className="h-9 w-9 shrink-0 object-cover" />
            ) : (
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center text-[0.7rem] tracking-wide text-white"
                style={{ background: primary }}
              >
                {initials(salon.name)}
              </span>
            )}

            <span className="min-w-0">
              <span className="block truncate font-display text-[1.05rem] font-light leading-tight">
                {salon.name}
              </span>
              {place && <span className="block truncate text-[0.68rem] text-ink/45">{place}</span>}
            </span>
          </a>

          {/* Le menu de la vitrine : des ancres, pas des pages mortes. */}
          <nav aria-label={salon.name} className="hidden items-center gap-7 lg:flex">
            {[
              { href: "#prestations", label: labels.sections.services },
              { href: "#equipe", label: labels.sections.team },
              { href: "#galerie", label: labels.sections.gallery },
              { href: "#avis", label: labels.sections.reviews },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.66rem] uppercase tracking-[0.16em] text-ink/50 transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {salon.publicBooking && (
            <a
              href={bookHref}
              className="shrink-0 px-5 py-2.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-85"
              style={{ background: primary, color: "#fff" }}
            >
              {labels.book}
            </a>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* ————————————————————————————— Hero plein cadre, aux couleurs du salon. */}
        <section id="top" className="relative isolate overflow-hidden" style={{ background: primary }}>
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element -- photo de la galerie du salon, même raison que le logo
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}

          {/* Voile : le texte doit tenir sur n'importe quelle photo. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.25)_0%,rgba(10,8,7,0.15)_40%,rgba(10,8,7,0.62)_100%)]"
          />

          <div className="container-x relative flex min-h-[82svh] flex-col justify-end pb-14 pt-24 text-white sm:pb-20">
            <span className="text-[0.66rem] uppercase tracking-[0.22em] opacity-70">
              {labels.breadcrumb}
            </span>

            <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.6rem,7vw,6rem)] font-light leading-[0.92] tracking-[-0.03em]">
              {salon.name}
            </h1>

            {salon.description && (
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed opacity-85">
                {salon.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.16em] opacity-75">
                {place && <span>{place}</span>}
                {reviews && reviews.reviews.length > 0 && (
                  <span className="tabular-nums">
                    {reviews.averageRating.toFixed(1)}/5 · {reviews.reviews.length}{" "}
                    {labels.reviewsCount}
                  </span>
                )}
                {!salon.publicBooking && <span>{labels.bookingClosed}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {salon.publicBooking && (
                  <a
                    href={bookHref}
                    className="px-7 py-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:text-white"
                    style={{ background: secondary }}
                  >
                    {labels.bookOnline}
                  </a>
                )}

                {gallery.length > 0 && (
                  <a
                    href="#galerie"
                    className="border-b border-white/35 pb-1 text-[0.7rem] uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-white hover:text-white"
                  >
                    {labels.sections.gallery}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ————————————————————————————— Prestations. */}
        <section id="prestations" className="border-b border-ink/10">
          <div className="container-x py-16 sm:py-20 lg:py-24">
            <SectionHead label={labels.sections.services} note={labels.servicesIntro} index="01" />

            {servicesQ.isPending && <Pending />}
            {servicesQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}
            {servicesQ.isSuccess && services.length === 0 && (
              <p className={`${BODY} text-ink/60`}>{labels.servicesEmpty}</p>
            )}

            {categories.length > 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {[null, ...categories].map((item) => (
                  <button
                    key={item ?? "all"}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`border px-4 py-2 text-[0.62rem] uppercase tracking-[0.16em] transition-colors ${
                      category === item
                        ? "border-transparent text-white"
                        : "border-ink/15 text-ink/55 hover:border-ink/40 hover:text-ink"
                    }`}
                    style={category === item ? { background: primary } : undefined}
                  >
                    {item ?? labels.servicesAll}
                  </button>
                ))}
              </div>
            )}

            {visibleServices.length > 0 && (
              <ol className="mt-10">
                {visibleServices.map((service, index) => (
                  <li
                    key={service.id ?? service.name}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-t border-ink/10 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] sm:gap-8 sm:py-6"
                  >
                    <span className={`${LABEL} tabular-nums text-ink/25`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-display text-[1.15rem] font-light leading-tight sm:text-[1.35rem]">
                        {service.name}
                      </span>
                      <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.14em] text-ink/40">
                        {service.category ? `${service.category} · ` : ""}
                        {service.durationMinutes} min
                      </span>
                      {service.description && (
                        <span className="mt-2 hidden max-w-[46ch] text-[0.85rem] leading-relaxed text-ink/55 sm:block">
                          {service.description}
                        </span>
                      )}
                    </span>

                    <span className="hidden text-[0.72rem] uppercase tracking-[0.14em] text-ink/30 sm:block">
                      {service.bookableOnline ? labels.bookOnline : ""}
                    </span>

                    <span
                      className="text-right font-display text-[1.05rem] tabular-nums sm:text-[1.2rem]"
                      style={{ color: primary }}
                    >
                      {formatPrice(service.price, labels.priceCurrency, intlLocale)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* ————————————————————————————— Équipe. */}
        <section id="equipe" className="border-b border-ink/10">
          <div className="container-x py-16 sm:py-20 lg:py-24">
            <SectionHead label={labels.sections.team} index="02" />

            {staffQ.isPending && <Pending />}
            {staffQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}
            {staffQ.isSuccess && team.length === 0 && (
              <p className={`${BODY} text-ink/60`}>{labels.teamEmpty}</p>
            )}

            {team.length > 0 && (
              <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((member) => (
                  <li key={member.id ?? `${member.firstName}-${member.lastName}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
                      {member.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- avatar fourni par le salon
                        <img
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="grid h-full w-full place-items-center font-display text-[clamp(2.5rem,6vw,4rem)] font-light text-white"
                          style={{ background: accent }}
                        >
                          {initials(`${member.firstName} ${member.lastName}`)}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-[1.25rem] font-light leading-tight">
                      {member.firstName} {member.lastName}
                    </h3>
                    {member.title && (
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.14em] text-ink/40">
                        {member.title}
                      </p>
                    )}
                    {member.specialties && member.specialties.length > 0 && (
                      <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/55">
                        {member.specialties.join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ————————————————————————————— Galerie : une mosaïque, pas une grille régulière. */}
        <section id="galerie" className="border-b border-ink/10">
          <div className="container-x py-16 sm:py-20 lg:py-24">
            <SectionHead label={labels.sections.gallery} index="03" />

            {galleryQ.isPending && <Pending />}
            {galleryQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}
            {galleryQ.isSuccess && gallery.length === 0 && (
              <p className={`${BODY} text-ink/60`}>{labels.galleryEmpty}</p>
            )}

            {gallery.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:auto-rows-[11rem] lg:auto-rows-[13rem]">
                {gallery.map((image, index) => (
                  <GalleryTile key={image.publicId} image={image} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ————————————————————————————— Avis. */}
        <section id="avis" className="border-b border-ink/10">
          <div className="container-x py-16 sm:py-20 lg:py-24">
            <SectionHead label={labels.sections.reviews} note={labels.reviewsNote} index="04" />

            {reviewsQ.isPending && <Pending />}
            {reviewsQ.isError && <p className={`${BODY} text-ink/60`}>{labels.unavailableBody}</p>}
            {reviews && reviews.reviews.length === 0 && (
              <p className={`${BODY} text-ink/60`}>{labels.reviewsEmpty}</p>
            )}

            {reviews && reviews.reviews.length > 0 && (
              <>
                {/* La synthèse : la note à gauche, la répartition à droite — le tout
                    sur une seule bande, pas en deux blocs de hauteurs inégales. */}
                <div className="mt-10 flex flex-wrap items-end justify-between gap-x-16 gap-y-10 border-t border-ink/10 pt-8">
                  <div>
                    <div className="flex items-end gap-3">
                      <span
                        className="font-display text-[clamp(3.25rem,7vw,5.5rem)] font-light leading-[0.8] tabular-nums"
                        style={{ color: primary }}
                      >
                        {reviews.averageRating.toFixed(1)}
                      </span>
                      <span className={`${LABEL} pb-2 text-ink/35`}>/ 5</span>
                    </div>

                    <span className="mt-4 flex items-center gap-1.5" aria-hidden>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <span
                          key={dot}
                          className={`h-2 w-2 ${dot <= Math.round(reviews.averageRating) ? "" : "opacity-20"}`}
                          style={{ background: accent }}
                        />
                      ))}
                    </span>

                    <p className="mt-3 text-[0.78rem] text-ink/50">
                      {reviews.reviews.length} {labels.reviewsCount}
                    </p>
                  </div>

                  {/* Des barres de 6 px, pas des filets d'un pixel : une répartition
                      qu'on ne voit pas ne dit rien. Comptée sur les avis publiés. */}
                  <ul className="flex w-full max-w-sm flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.reviews.filter(
                        (review) => Math.round(review.rating) === star,
                      ).length;
                      const share = Math.round((count / reviews.reviews.length) * 100);

                      return (
                        <li
                          key={star}
                          className="grid grid-cols-[2.6rem_minmax(0,1fr)_1.6rem] items-center gap-4"
                        >
                          <span className="text-[0.7rem] tabular-nums text-ink/45">{star} ★</span>
                          <span className="block h-1.5 w-full bg-ink/[0.08]">
                            <span
                              className="block h-full"
                              style={{ width: `${share}%`, background: primary }}
                            />
                          </span>
                          <span className="text-right text-[0.7rem] tabular-nums text-ink/40">
                            {count}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Les avis, en cases à filets — la citation d'abord, la personne ensuite. */}
                <ul className="mt-10 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {reviews.reviews.map((review) => (
                    <li key={review.id} className="flex flex-col border border-ink/12 p-6">
                      <span
                        className="flex items-center gap-1.5"
                        aria-label={`${review.rating}/5`}
                      >
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            aria-hidden
                            className={`h-1.5 w-1.5 ${dot <= Math.round(review.rating) ? "" : "opacity-20"}`}
                            style={{ background: accent }}
                          />
                        ))}
                      </span>

                      {/* Sans commentaire, la case ne porte que la note et le nom : on
                          n'écrit pas « /5 » tout seul, qui ne veut rien dire. */}
                      {review.comment && (
                        <p className="mt-4 font-display text-[1.1rem] font-light leading-[1.45] text-ink/85">
                          « {review.comment} »
                        </p>
                      )}

                      <span className="mt-auto pt-6 text-[0.78rem] text-ink/50">
                        {review.customerName}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Laisser un avis ne dépend PAS de la lecture des avis : la case est
                toujours là, y compris sans aucun avis publié (le cas où elle sert le
                plus) et y compris si la lecture a échoué — écrire reste possible. */}
            <div className="mt-12 border border-ink/12 p-6 sm:p-8">
              <SalonReviewForm slug={slug} primary={primary} accent={accent} />
            </div>
          </div>
        </section>

        {/* ————————————————————————————— Réservation : le seul endroit qui écrit. */}
        <section id="reservation" className="border-b border-ink/10 bg-white">
          <div className="container-x grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHead label={labels.sections.booking} index="05" />
              <h2 className="mt-6 max-w-[14ch] font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-light leading-[1.04] tracking-[-0.02em]">
                {labels.booking.title}
              </h2>
              <p className={`mt-4 max-w-sm ${BODY} text-ink/60`}>{labels.booking.lead}</p>

              {!salon.publicBooking && (
                <p
                  className={`mt-6 border-l-2 pl-4 ${BODY} text-ink/60`}
                  style={{ borderColor: primary }}
                >
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

        {/* ————————————————————————————— Contact : écrire au salon, ou le joindre
                                            autrement — les deux moitiés de la ligne. */}
        <section id="contact">
          <div className="container-x py-16 sm:py-20 lg:py-24">
            <SectionHead label={labels.sections.contact} index="06" />

            <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="max-w-[30ch] font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-light leading-[1.15] tracking-[-0.02em]">
                  {labels.contact.lead}
                </p>

                {place && (
                  <p className={`${LABEL} mt-6 text-ink/35`}>{place}</p>
                )}

                {channels.length > 0 && (
                  <>
                    <p className={`${LABEL} mt-8 text-ink/35`}>{labels.reachTitle}</p>

                    <ul className="mt-4">
                      {channels.map((channel) => (
                        <li key={channel.label}>
                          <a
                            href={channel.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-4 border-t border-ink/10 py-3 text-[0.85rem] text-ink/70 transition-colors hover:text-ink"
                          >
                            {channel.label}
                            <span aria-hidden className="text-ink/30">
                              ↗
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="lg:col-span-8">
                <SalonContactForm slug={slug} primary={primary} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ————————————————————————————————— Pied de page : le salon, puis la plateforme. */}
      <footer style={{ background: primary }} className="text-white">
        <div className="container-x py-12">
          <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-light leading-tight">
            {salon.name}
          </p>
          {place && <p className="mt-2 text-[0.72rem] uppercase tracking-[0.16em] opacity-70">{place}</p>}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 text-[0.62rem] uppercase tracking-[0.16em] opacity-70">
            <span>
              © {new Date().getFullYear()} {salon.name}
            </span>
            <span>
              {labels.poweredBy}{" "}
              <Link href={`/${locale}`} className="underline underline-offset-4 hover:opacity-100">
                {dict.site.name}
              </Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Le haut d'une section : numéro, étiquette, note. Le même motif partout. */
function SectionHead({
  label,
  note,
  index,
}: {
  label: string;
  note?: string;
  index: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
      <span className="flex items-baseline gap-4">
        <span className={`${LABEL} tabular-nums text-ink/25`}>[ {index} ]</span>
        <h2 className="font-display text-[1.3rem] font-light leading-tight">{label}</h2>
      </span>
      {note && <p className="max-w-xs text-[0.75rem] leading-relaxed text-ink/40">{note}</p>}
    </div>
  );
}

/**
 * Une image de la galerie. La première occupe deux colonnes et deux lignes, puis le
 * rythme alterne : grandes et petites, comme une planche de magazine.
 */
function GalleryTile({ image, index }: { image: SalonGalleryImage; index: number }) {
  const span =
    index === 0
      ? "col-span-2 row-span-2"
      : index % 5 === 3
        ? "col-span-2"
        : "";

  return (
    <figure
      className={`group relative overflow-hidden bg-ink/[0.06] ${span} ${
        index === 0 ? "min-h-[16rem]" : "min-h-[10rem]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- image de la galerie du salon */}
      <img
        src={image.secureUrl}
        alt={image.caption ?? ""}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />

      {image.caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(10,8,7,0.6),transparent)] px-4 pb-3 pt-10 text-[0.7rem] uppercase tracking-[0.14em] text-white/90">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Chargement d'une section : une ligne, jamais un faux contenu. */
function Pending() {
  return (
    <p aria-hidden className="mt-8 text-sm text-ink/30">
      …
    </p>
  );
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
