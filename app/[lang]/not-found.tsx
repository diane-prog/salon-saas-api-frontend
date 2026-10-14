"use client";

import Image from "next/image";
import { ButtonLink } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import { locales, localeNames, localePath } from "@/lib/dictionaries";

/**
 * Page « introuvable » des chemins préfixés par une langue (`/fr/…`, `/en/…`).
 *
 * POURQUOI CE COMPOSANT EST CLIENT, ET C'EST LE POINT : un `not-found.tsx` ne reçoit aucun
 * paramètre de route — même sous le layout `[lang]`. La version précédente prenait donc le
 * premier dictionnaire de la liste, c'est-à-dire le français : la 404 du site anglais
 * s'affichait entièrement en français.
 *
 * On pourrait déduire la langue du cookie ou de `Accept-Language` — c'est ce que fait le
 * proxy, et ce serait une approximation : un visiteur anglophone dont le navigateur est en
 * français, arrivé sur `/en/…`, recevrait une 404 française. La vérité est dans l'URL, et
 * l'URL est déjà connue ici : ce fichier est rendu SOUS le layout `[lang]`, qui monte le
 * fournisseur de dictionnaire avec la langue du segment. On la lit donc à la source, comme
 * le header et le pied de page le font — c'est le même mécanisme, une seule règle pour tout
 * le site. Le rendu reste côté serveur (le composant est rendu en HTML), il n'y a rien à
 * attendre pour lire le texte.
 *
 * Les deux boutons mènent à l'accueil de chaque langue : leur intitulé est le nom de la
 * langue, pas « Accueil » — deux boutons « Accueil » côte à côte ne diraient pas où ils
 * emmènent, et les noms de langue s'écrivent toujours dans leur langue.
 */
export default function NotFound() {
  const { dict } = useDictionary();

  return (
    /* Même traitement que les autres pages hors accueil : fond clair + photo
       `other-hero`, avec le voile noir en haut pour le header blanc. */
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-[#f1f2f2] pt-36 pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/img/other-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#f1f2f2]/80" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 via-black/45 to-transparent" />
      </div>

      <div className="container-x relative flex flex-col items-center gap-6 text-center">
        <span className="text-7xl font-light text-navy/10 sm:text-9xl">404</span>
        <h1 className="text-3xl text-navy sm:text-4xl">{dict.ui.notFoundTitle}</h1>
        <p className="max-w-md text-base text-muted">{dict.ui.notFoundBody}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {locales.map((l) => (
            <ButtonLink key={l} href={localePath(l)} variant="outline">
              {localeNames[l]}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
