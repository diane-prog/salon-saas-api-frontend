"use client";

import Link from "next/link";

import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSalonReviews, useSalonServices, useSalonStaff } from "@/features/public-salon/queries";
import { LABEL } from "@/lib/editorial";

/**
 * Les chiffres du salon de démonstration, **en direct**.
 *
 * POURQUOI CETTE FORME : la bande d'encre à quatre colonnes séparait les nombres du reste
 * de la page — un bloc sombre posé au milieu du papier, avec ses propres règles. Ici, la
 * section est du PAPIER comme le reste, et ce sont les NOMBRES qui portent la section :
 * quatre très grands chiffres alignés sur une ligne, un filet entre eux, l'étiquette en
 * petites capitales au-dessus et l'unité en dessous. Rien d'autre.
 *
 * CE QUI RESTE VRAI : tout vient de l'API du salon de démonstration (`/public/{slug}/…`),
 * rien n'est inventé, et une API muette fait disparaître la section plutôt que d'afficher
 * des zéros. Pendant le chargement, la place est tenue par un tiret cadratin : la ligne ne
 * saute pas quand la réponse arrive, et elle n'affirme rien entre les deux.
 *
 * Le lien vers les fonctionnalités ferme la section, à droite, comme une note de marge.
 */
const SLUG = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG ?? "";

export default function LiveStats({
  linkHref,
  linkLabel,
}: {
  linkHref: string;
  linkLabel: string;
}) {
  const { dict } = useDictionary();
  const { stats, ui } = dict;

  const services = useSalonServices(SLUG);
  const staff = useSalonStaff(SLUG);
  const reviews = useSalonReviews(SLUG);

  const queries = [services, staff, reviews];
  const pending = queries.some((query) => query.isPending);
  const failed = queries.some((query) => query.isError);

  if (failed) return null;

  const values = [
    { label: stats[0].label, value: services.data?.data.length, suffix: "" },
    { label: stats[1].label, value: staff.data?.data.length, suffix: "" },
    { label: stats[2].label, value: reviews.data?.data.reviews.length, suffix: "" },
    {
      label: stats[3].label,
      value: reviews.data ? reviews.data.data.averageRating.toFixed(1) : undefined,
      suffix: "/5",
    },
  ];

  return (
    <section className="border-y border-ink/10 bg-paper text-ink">
      <div className="container-x py-16 sm:py-20">
        {/* ——— En-tête : l'état du direct à gauche, la provenance à droite. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <span className={`${LABEL} flex items-center gap-2 text-ink/40`}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            [ {ui.demo.eyebrow} ]
          </span>

          <span className={`${LABEL} text-ink/30`}>{dict.site.name}</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h2 className="max-w-[18ch] text-[clamp(1.7rem,3.4vw,2.75rem)] font-light leading-[1.05] tracking-[-0.025em] lg:col-span-7">
            {ui.statsTitle}
          </h2>

          <p className="max-w-md text-[0.92rem] leading-relaxed text-ink/55 lg:col-span-5">
            {ui.statsBody}
          </p>
        </div>

        {/* ——— Les quatre nombres : une ligne, des filets, aucune carte. */}
        <dl className="mt-12 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
          {values.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[10.5rem] flex-col justify-between bg-paper p-5 sm:min-h-[12rem] sm:p-6"
            >
              <dt className={`${LABEL} max-w-[10ch] leading-[1.7] text-ink/40`}>{item.label}</dt>

              <dd className="mt-8 flex items-baseline gap-1 font-display text-[clamp(2.6rem,6.4vw,5.2rem)] leading-[0.82] tracking-[-0.04em] tabular-nums text-ink">
                {pending || item.value === undefined ? (
                  <span className="text-ink/20">—</span>
                ) : (
                  <>
                    {item.value}
                    {item.suffix && (
                      <span className="text-[0.9rem] tracking-normal text-ink/35">
                        {item.suffix}
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* ——— Pied de section : la sortie, et la source — dite, pas suggérée. */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <Link
            href={linkHref}
            className={`${LABEL} group inline-flex items-center gap-2 text-ink/45 transition-colors hover:text-ink`}
          >
            {linkLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          <span className={`${LABEL} text-ink/25`}>[ API · {dict.site.name} ]</span>
        </div>
      </div>
    </section>
  );
}
