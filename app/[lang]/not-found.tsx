"use client";

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
 * VISUEL : plus de photo d'ambiance ni de voile noir. Un grand « 404 » en encre pâle (décoratif,
 * `aria-hidden` — le titre se lit, lui), un filet de laiton, une phrase, deux liens. C'est la
 * main des autres pages : papier, encre, un seul accent.
 *
 * Les deux boutons mènent à l'accueil de chaque langue : leur intitulé est le nom de la
 * langue, pas « Accueil » — deux boutons « Accueil » côte à côte ne diraient pas où ils
 * emmènent, et les noms de langue s'écrivent toujours dans leur langue.
 */
export default function NotFound() {
  const { dict } = useDictionary();

  return (
    <section className="relative flex min-h-[80vh] items-center bg-paper pt-32 pb-24 text-ink">
      <div className="container-x relative flex flex-col items-start gap-6">
        <span
          aria-hidden
          className="font-display text-[clamp(4rem,16vw,9rem)] leading-[0.8] text-ink/15"
        >
          404
        </span>

        <span aria-hidden className="h-px w-12 bg-brand/70" />

        <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.015em]">
          {dict.ui.notFoundTitle}
        </h1>
        <p className="max-w-md text-[0.98rem] leading-relaxed text-ink/60">
          {dict.ui.notFoundBody}
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {locales.map((l) => (
            <ButtonLink key={l} href={localePath(l)} variant="primary">
              {localeNames[l]}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
