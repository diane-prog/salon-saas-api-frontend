"use client";

import Link from "next/link";

import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Hero de l'accueil — la première page du produit, pas une page d'agence.
 *
 * Ce qui a changé et pourquoi :
 *   - plus de vidéo de fond ni de parallaxe : sur une connexion moyenne, un plan
 *     vidéo plein cadre retarde le premier mot de trois secondes et donne au
 *     logiciel l'allure d'un site vitrine. Ici, le premier écran est du TEXTE
 *     et une pièce de produit dessinée en HTML — le seul média qui ne ment pas ;
 *   - un titre en sérif éditorial, très grand, sur papier chaud : c'est ce qui
 *     distingue une maison d'un tableau de bord générique ;
 *   - la preuve est à droite : un aperçu de l'agenda, avec ses heures, ses
 *     statuts et sa réservation en ligne. L'aperçu est annoncé comme tel.
 *
 * Rien n'est animé au défilement : le hero doit être lisible avant que React
 * n'ait fini de s'hydrater.
 */
export default function HomeHero() {
  const { dict, locale } = useDictionary();
  const { hero, ui } = dict;
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  /* La vitrine de démonstration est celle du salon configuré : si la variable
     n'est pas posée, on renvoie vers la page fonctionnalités plutôt que vers
     une adresse qui n'existerait pas. */
  const demoSlug = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG;
  const demoHref = href(demoSlug ? `/s/${demoSlug}` : "/services");

  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-paper text-ink">
      <div className="container-x grid min-h-[90svh] items-center gap-14 pb-14 pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-36">
        {/* ——— Le propos. */}
        <div className="flex flex-col lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[0.66rem] font-medium uppercase tracking-[0.24em] text-ink/45">
              {ui.agency}
            </span>
            <span aria-hidden className="h-px w-8 bg-ink/20" />
            <span className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-ink/45">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              {hero.liveLabel}
            </span>
          </div>

          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.9rem,7.2vw,5.9rem)] leading-[0.94] tracking-[-0.02em]">
            {hero.leadStatic}
            <span className="block italic text-brand">{hero.leadRotating[0]}</span>
          </h1>

          <p className="mt-7 max-w-lg text-[0.98rem] leading-relaxed text-ink/65">
            {hero.body}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={href("/register")}
              className="group inline-flex items-center gap-3 bg-ink px-7 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-brand"
            >
              {ui.freeQuote}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href={demoHref}
              className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/55 underline-offset-8 transition-colors hover:text-ink hover:underline"
            >
              {ui.auth.panel.demo}
            </Link>
          </div>

          {/* Trois repères de lecture, pas trois promesses marketing. */}
          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-px border-t border-ink/15 pt-6">
            {hero.reassurances.map((item) => (
              <div key={item.label} className="pr-4">
                <dt className="font-display text-2xl leading-none text-ink">{item.value}</dt>
                <dd className="mt-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ——— La pièce de produit. Annoncée comme un aperçu : aucune donnée
                n'est présentée comme réelle. */}
        <div className="relative lg:col-span-5">
          <div
            aria-hidden
            className="absolute -inset-x-6 -inset-y-6 border border-ink/10 lg:-inset-x-10 lg:-inset-y-10"
          />

          <div className="relative bg-navy text-paper shadow-[0_30px_80px_-40px_rgba(21,17,14,0.55)]">
            <div className="flex items-center justify-between border-b border-paper/10 px-6 py-5">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-paper/40">
                  {hero.previewLabel}
                </p>
                <p className="mt-1 font-display text-xl">{hero.previewDay}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-turquoise">
                <span className="h-1.5 w-1.5 rounded-full bg-turquoise" />
                4 · 7
              </span>
            </div>

            <ul className="divide-y divide-paper/[0.08]">
              {hero.previewRows.map((row) => (
                <li key={row.time} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-12 shrink-0 font-display text-base tabular-nums text-paper/45">
                    {row.time}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-paper">{row.service}</span>
                    <span className="block text-[0.68rem] text-paper/40">{row.staff}</span>
                  </span>
                  <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.14em] text-turquoise">
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-paper/10 px-6 py-4">
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-paper/40">
                {hero.previewTotal}
              </span>
              <span className="font-display text-lg tabular-nums text-turquoise">186 €</span>
            </div>
          </div>

          <div className="relative mt-4 ml-auto w-[86%] border border-ink/15 bg-paper p-5">
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-ink/40">
              {hero.previewBooking}
            </p>
            <p className="mt-2 text-sm text-ink/75">{hero.previewBookingBody}</p>
          </div>
        </div>
      </div>

      {/* ——— Bandeau de bas de hero : le vocabulaire produit, une fois. */}
      <div className="border-t border-ink/10">
        <div className="container-x flex flex-wrap items-center gap-x-8 gap-y-2 py-5 text-[0.62rem] uppercase tracking-[0.22em] text-ink/40">
          {hero.ticker.map((item, index) => (
            <span key={item} className="flex items-center gap-8">
              {index > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-brand/60" />}
              {item}
            </span>
          ))}
          <span aria-hidden className="ml-auto hidden h-px flex-1 bg-ink/10 sm:block" />
          <span className="hidden text-ink/30 sm:inline">{dict.site.address}</span>
        </div>
      </div>
    </section>
  );
}
