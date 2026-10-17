"use client";

import Link from "next/link";

import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL } from "@/lib/editorial";
import { useSalonInfo, useSalonServices, useSalonStaff } from "@/features/public-salon/queries";

/**
 * Section « En direct » de l'accueil (`#demo`).
 *
 * CE QU'ELLE MONTRE, ET COMMENT : les données réelles du salon de démonstration,
 * lues sur l'API pendant que la page s'affiche — le nom, les trois couleurs de sa
 * vitrine, ses prestations avec leur durée et leur prix, son équipe. Rien n'est
 * écrit à la main, rien n'est mis en scène.
 *
 * CE QUI A ÉTÉ RETIRÉ : la maquette d'écran de la colonne de droite (un cadre, un
 * en-tête peint aux couleurs du salon, une pastille « réservation ouverte », des
 * listes à l'intérieur). Elle ressemblait à une capture du logiciel — donc à une
 * promesse — alors que la section doit montrer une donnée. Ici, pas de cadre et
 * pas de faux écran : du papier, des filets d'un pixel, de la typographie. La
 * personnalisation se lit dans trois traits de couleur posés à côté du nom, et le
 * nom mène à la vraie page du salon.
 *
 * TROIS ÉTATS, dits franchement : chargement (une ligne, pas de valeur inventée),
 * échec (une phrase honnête, aucune valeur d'exemple), réponse (les vraies lignes).
 *
 * Les requêtes sont les mêmes que `LiveStats`, donc partagées par le cache : un
 * seul aller-retour par ressource pour toute la page.
 */
const SLUG = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG ?? "";

export default function SalonDemo() {
  const { dict, locale } = useDictionary();
  const { demo } = dict.ui;

  const info = useSalonInfo(SLUG);
  const services = useSalonServices(SLUG);
  const staff = useSalonStaff(SLUG);

  const loading = [info, services, staff].some((query) => query.isPending);
  const failed = [info, services, staff].some((query) => query.isError);

  const salon = info.data?.data;
  const serviceList = services.data?.data ?? [];
  const teamList = staff.data?.data ?? [];

  /** Les couleurs réelles de la vitrine, réduites à trois traits. */
  const swatches = salon
    ? [salon.colors.primary, salon.colors.secondary, salon.colors.accent]
    : [];

  return (
    <section id="demo" className="bg-white text-ink">
      <div className="container-x py-20 sm:py-24 lg:py-28">
        {/* ——— Ligne haute : l'état du direct à gauche, la provenance à droite. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-ink/10 pb-5">
          <span className={`${LABEL} flex items-center gap-2 text-ink/45`}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />[ {demo.eyebrow} ]
          </span>
          <span className={`${LABEL} text-ink/25`}>[ API · {dict.site.name} ]</span>
        </div>

        {/* ——— Le titre, puis la phrase qui dit d'où viennent les données. */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h2 className="max-w-[22ch] font-display text-[clamp(1.9rem,3.6vw,3rem)] font-light leading-[1.04] tracking-[-0.02em] lg:col-span-7">
            {demo.title}
          </h2>

          <p className={`max-w-md text-ink/55 lg:col-span-5 ${BODY}`}>{demo.body}</p>
        </div>

        {/* ——— API muette : une phrase, et rien d'autre. Une valeur d'exemple serait une
                donnée inventée. */}
        {failed && (
          <p className="mt-12 max-w-xl border-t border-ink/10 pt-6 text-sm text-ink/50">
            {demo.unavailable}
          </p>
        )}

        {/* ——— Le salon, en deux colonnes : les prestations à gauche, l'équipe à droite.
                Aucune maquette d'écran, seulement des lignes et un filet vertical. */}
        {!failed && (
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-0">
            <div className="lg:col-span-7 lg:pr-12">
              {/* Le nom — cliquable vers la vraie page du salon — et ses couleurs. */}
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-ink/10 pb-4">
                <div>
                  <span className={`${LABEL} block text-ink/35`}>{demo.salonLabel}</span>

                  {salon ? (
                    <Link
                      href={`/${locale}/s/${salon.slug}`}
                      className="mt-2 block w-fit font-display text-[clamp(1.7rem,3.2vw,2.6rem)] font-light leading-none tracking-[-0.02em] transition-colors hover:text-brand"
                    >
                      {salon.name}
                    </Link>
                  ) : (
                    <span className="mt-2 block font-display text-[clamp(1.7rem,3.2vw,2.6rem)] font-light leading-none tracking-[-0.02em] text-ink/25">
                      —
                    </span>
                  )}
                </div>

                {swatches.length > 0 && (
                  <span aria-hidden className="flex items-end gap-1 pb-1">
                    {swatches.map((color, index) => (
                      <span
                        key={`${color}-${index}`}
                        className="block w-1.5 rounded-full"
                        style={{ background: color, height: `${1.6 + index * 0.5}rem` }}
                      />
                    ))}
                  </span>
                )}
              </div>

              {/* Les prestations : numéro, nom, durée, prix — les vraies lignes du salon. */}
              <div className="mt-8">
                <span className={`${LABEL} text-ink/35`}>{demo.servicesLabel}</span>

                <ul className="mt-4">
                  {loading && (
                    <li className="border-b border-ink/10 py-4 text-sm text-ink/40">
                      {dict.ui.dashboard.loading}
                    </li>
                  )}

                  {!loading && serviceList.length === 0 && (
                    <li className="border-b border-ink/10 py-4 text-sm text-ink/50">{demo.empty}</li>
                  )}

                  {!loading &&
                    serviceList.map((service, index) => (
                      <li
                        key={`${service.name}-${index}`}
                        className="flex items-baseline gap-4 border-b border-ink/10 py-3.5"
                      >
                        <span className={`${LABEL} shrink-0 tabular-nums text-ink/25`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.95rem]">{service.name}</span>
                        <span className="shrink-0 tabular-nums text-[0.78rem] text-ink/40">
                          {service.durationMinutes} {demo.min}
                        </span>
                        <span className="w-16 shrink-0 text-right tabular-nums text-[0.95rem]">
                          {service.price} €
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* ——— L'équipe et la sortie, dans la colonne de droite. */}
            <div className="lg:col-span-5 lg:border-l lg:border-ink/10 lg:pl-12">
              <span className={`${LABEL} text-ink/35`}>{demo.teamLabel}</span>

              <ul className="mt-4">
                {loading && (
                  <li className="border-b border-ink/10 py-3.5 text-sm text-ink/40">
                    {dict.ui.dashboard.loading}
                  </li>
                )}

                {!loading && teamList.length === 0 && (
                  <li className="border-b border-ink/10 py-3.5 text-sm text-ink/50">{demo.empty}</li>
                )}

                {!loading &&
                  teamList.map((member, index) => (
                    <li
                      key={`${member.firstName}-${member.lastName}-${index}`}
                      className="border-b border-ink/10 py-3.5"
                    >
                      <span className="block truncate font-light text-[1.05rem] leading-tight">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.title && (
                        <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.14em] text-ink/35">
                          {member.title}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>

              <Link
                href={`/${locale}/register`}
                className="mt-8 inline-flex w-fit items-center gap-2 bg-ink px-6 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
              >
                {demo.cta}
              </Link>

              {salon && (
                <p className={`${LABEL} mt-8 block text-ink/25`}>
                  [ {salon.publicBooking ? demo.bookingOpen : demo.bookingClosed} ]
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
