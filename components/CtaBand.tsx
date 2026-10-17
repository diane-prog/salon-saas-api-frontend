"use client";

import Link from "next/link";

import SplitText from "@/components/SplitText";
import { ArrowUpRight, Mail, Phone, Pin } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL } from "@/lib/editorial";

/**
 * Bandeau de conclusion, présent en bas de chaque page — « Parlons-en ».
 *
 * CE QUI A CHANGÉ : l'ancienne version rangeait les coordonnées dans une marge de gauche
 * et l'affirmation à droite, comme n'importe quel bloc de la page. Une fin de page doit
 * avoir une autre voix : ici l'affirmation prend TOUTE la largeur, en très grand corps
 * (`clamp(2.2rem, 6vw, 5rem)`), et le reste se range dessous — la phrase, puis l'action,
 * puis les trois façons de joindre la maison.
 *
 * La bande n'est plus un objet à part : même papier, mêmes filets, mêmes crochets que le
 * reste du site. Le titre reste révélé mot à mot par `SplitText` — c'est la seule animation.
 *
 * Les coordonnées sont des CASES à filets (courriel, téléphone, adresse), avec l'icône en
 * tête : c'est la même grille que les sections « ce que ça donne » et « pourquoi », donc la
 * page se termine sur un vocabulaire déjà lu, pas sur un nouveau.
 */
export default function CtaBand() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const { finalCta, site, ui } = dict;

  return (
    <section className="border-t border-ink/10 bg-paper text-ink">
      <div className="container-x py-20 sm:py-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <span className={`${LABEL} text-ink/40`}>[ {ui.talkToUs} ]</span>
          <span className={`${LABEL} text-ink/25`}>
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>

        {/* ——— L'affirmation, seule sur sa largeur. */}
        <SplitText
          as="h2"
          text={finalCta.title}
          className="mt-8 max-w-[19ch] font-light text-[clamp(2.2rem,6vw,5rem)] leading-[0.96] tracking-[-0.04em]"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <p className="max-w-md text-[1rem] leading-relaxed text-ink/60 lg:col-span-7">
            {finalCta.body}
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-5 lg:justify-end">
            {/* Bouton carré : le même geste que dans le hero — aucun arrondi sur les
                actions principales du site. */}
            <Link
              href={href("/register")}
              className="inline-flex items-center gap-2 bg-ink px-7 py-4 text-[0.64rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-brand"
            >
              {finalCta.primary}
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              href={href("/contact")}
              className="text-[0.64rem] uppercase tracking-[0.16em] text-ink/55 underline decoration-ink/20 underline-offset-[6px] transition-colors hover:text-ink"
            >
              {finalCta.secondary}
            </Link>
          </div>
        </div>

        {/* ——— Les trois façons de joindre la maison, en cases à filets. */}
        <dl className="mt-16 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
          <div className="flex min-h-[8.5rem] flex-col justify-between gap-6 bg-white p-6">
            <dt>
              <Mail className="h-4 w-4 text-ink/35" />
            </dt>
            <dd>
              <a
                href={`mailto:${site.email}`}
                className="break-all text-[0.95rem] font-light text-ink transition-colors hover:text-brand"
              >
                {site.email}
              </a>
            </dd>
          </div>

          <div className="flex min-h-[8.5rem] flex-col justify-between gap-6 bg-white p-6">
            <dt>
              <Phone className="h-4 w-4 text-ink/35" />
            </dt>
            <dd>
              <a
                href={site.phoneRaw}
                className="text-[0.95rem] font-light tabular-nums text-ink transition-colors hover:text-brand"
              >
                {site.phone}
              </a>
            </dd>
          </div>

          <div className="flex min-h-[8.5rem] flex-col justify-between gap-6 bg-white p-6">
            <dt>
              <Pin className="h-4 w-4 text-ink/35" />
            </dt>
            <dd className="max-w-[26ch] text-[0.95rem] font-light leading-snug text-ink/70">
              {site.address}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
