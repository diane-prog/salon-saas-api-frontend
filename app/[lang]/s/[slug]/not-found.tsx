"use client";

import Link from "next/link";

import { useDictionary } from "@/components/DictionaryProvider";

/**
 * 404 d'une vitrine de salon.
 *
 * Elle remplace volontairement la 404 générale du site : quelqu'un qui suit le
 * lien d'un salon fermé ou mal recopié n'a pas cliqué sur une page de Belora, il
 * cherchait un salon. La phrase le dit, et la seule sortie utile est l'accueil de
 * la plateforme — pas le plan du site commercial.
 *
 * Composant client pour lire le dictionnaire du layout `[lang]` : un
 * `not-found.tsx` ne reçoit aucun paramètre de route (même raison que
 * `app/[lang]/not-found.tsx`), et c'est le fournisseur monté par ce layout qui
 * connaît la langue.
 */
export default function SalonNotFound() {
  const { dict, locale } = useDictionary();
  const labels = dict.storefront;

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-md text-center">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink/40">
          {dict.site.name}
        </span>

        <h1 className="mt-4 font-light text-2xl leading-tight sm:text-3xl">
          {labels.notFoundTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">{labels.notFoundBody}</p>

        <Link
          href={`/${locale}`}
          className="mt-7 inline-flex bg-ink px-5 py-2.5 text-xs text-paper transition-opacity hover:opacity-85"
        >
          {labels.backHome}
        </Link>
      </div>
    </main>
  );
}
