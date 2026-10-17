"use client";

import Link from "next/link";

import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Les six fonctionnalités, en liste éditoriale.
 *
 * Pourquoi cette forme plutôt qu'une grille de cartes : six cartes identiques
 * font un catalogue ; six lignes numérotées, avec une échelle de titre qui
 * change à chaque survol, racontent le produit comme une maison raconte ses
 * prestations. Chaque ligne est un lien vers sa page — la liste sert aussi de
 * navigation.
 *
 * Aucun effet de défilement ni vidéo : la section est lisible sans JavaScript,
 * et elle ne dépend d'aucune animation pour exister.
 */
export default function ServicesEditorial() {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;

  return (
    <section className="border-t border-ink/10 bg-paper text-ink">
      <div className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <span className="text-[0.64rem] uppercase tracking-[0.22em] text-ink/40">
              01 — {ui.servicesTitle}
            </span>
            <h2 className="mt-5 max-w-sm font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] tracking-[-0.015em]">
              {ui.servicesTitle}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/55">{ui.servicesBody}</p>

            <Link
              href={`/${locale}/services`}
              className="group mt-8 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-ink/60 transition-colors hover:text-brand"
            >
              {ui.viewAllServices}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ol className="border-t border-ink/15 lg:col-span-8">
          {services.map((service, index) => (
            <li key={service.slug} className="border-b border-ink/15">
              <Link
                href={`/${locale}/services/${service.slug}`}
                className="group grid grid-cols-[2.4rem_minmax(0,1fr)_auto] items-start gap-4 py-6 transition-colors hover:bg-ink/[0.025] sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-6 sm:py-8"
              >
                <span className="font-display text-sm tabular-nums text-ink/30 transition-colors group-hover:text-brand sm:text-base">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block font-display text-[clamp(1.35rem,2.6vw,2rem)] leading-tight tracking-[-0.01em] text-ink transition-transform duration-300 group-hover:translate-x-1">
                    {service.title}
                  </span>
                  <span className="mt-2 block max-w-xl text-sm leading-relaxed text-ink/55">
                    {service.short}
                  </span>
                </span>

                <span className="mt-1 grid h-9 w-9 place-items-center border border-ink/15 text-ink/50 transition-all duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-paper">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
