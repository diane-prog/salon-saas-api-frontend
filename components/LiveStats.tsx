"use client";

import Link from "next/link";

import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSalonReviews, useSalonServices, useSalonStaff } from "@/features/public-salon/queries";

/**
 * Les chiffres du salon de démonstration, **en direct**.
 *
 * Même contrat que la version précédente — rien n'est inventé, et une API
 * muette fait disparaître la section plutôt que d'afficher des zéros — mais une
 * autre forme : une bande d'encre, quatre colonnes séparées par des filets, et
 * des nombres en sérif très grands. C'est la même matière que le hero : une
 * maison, pas un tableau de bord.
 *
 * Pendant le chargement, les emplacements sont réservés avec un tiret cadratin :
 * la section ne saute pas quand la réponse arrive, et elle n'affirme rien entre
 * les deux.
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
    <section className="border-t border-ink/10 bg-navy text-paper">
      <div className="container-x grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <span className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-turquoise">
            <span className="h-1.5 w-1.5 rounded-full bg-turquoise" />
            {ui.demo.eyebrow}
          </span>

          <h2 className="mt-5 max-w-sm font-display text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.01em]">
            {ui.statsTitle}
          </h2>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/55">{ui.statsBody}</p>

          <Link
            href={linkHref}
            className="group mt-7 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-turquoise"
          >
            {linkLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-paper/10 lg:col-span-8 lg:grid-cols-4">
          {values.map((item) => (
            <div key={item.label} className="flex flex-col justify-between bg-navy px-4 py-6 sm:px-6">
              <dt className="text-[0.62rem] uppercase leading-relaxed tracking-[0.15em] text-paper/40">
                {item.label}
              </dt>
              <dd className="mt-8 font-display text-[clamp(2.4rem,4.6vw,3.6rem)] leading-none tabular-nums text-turquoise">
                {pending || item.value === undefined ? "—" : item.value}
                {!pending && item.value !== undefined && (
                  <span className="text-base text-paper/35">{item.suffix}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 py-4 text-[0.62rem] uppercase tracking-[0.16em] text-paper/30">
        <span>{ui.demo.eyebrow} · {dict.site.name}</span>
        <span>Source : API du salon de démonstration</span>
      </div>
    </section>
  );
}
