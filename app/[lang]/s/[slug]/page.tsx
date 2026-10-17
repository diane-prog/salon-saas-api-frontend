import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import SalonPage from "@/components/SalonPage";
import { getDictionary, isLocale, localePath, localeTags, locales } from "@/lib/dictionaries";
import { lookupSalon } from "@/features/public-salon/server";
import { absoluteUrl } from "@/lib/seo";

/**
 * La vitrine publique d'un salon.
 *
 * POURQUOI ELLE EST ICI et pas dans `(site)` : la vitrine du salon n'est PAS une
 * page de Belora. Elle porte le nom, le logo et les couleurs du salon, et son
 * seul lien vers la plateforme est discret en pied de page. Lui donner le header
 * commercial et la barre d'actions du site ferait de la page d'un client une
 * page de publicité pour son fournisseur. Le layout `[lang]` suffit donc : les
 * styles, la police et le fournisseur de dictionnaire, rien de plus.
 *
 * POURQUOI L'IDENTITÉ EST LUE ICI, côté serveur : c'est la seule façon de
 * répondre un **vrai 404** quand le slug est inconnu, et d'annoncer le **vrai
 * nom** du salon dans les métadonnées et le partage social. Le reste de la page
 * (prestations, équipe, galerie, avis, créneaux) est chargé par les hooks de
 * `features/public-salon`, avec les mêmes clés de cache que la landing.
 *
 * Les deux issues d'erreur sont distinctes et honnêtes :
 *   - 404 : le serveur a dit que ce salon n'existe pas → page introuvable ;
 *   - API muette : on ignore tout du salon → bandeau « momentanément
 *     indisponible » avec un lien qui retente, jamais un salon d'exemple.
 */

/** Le slug d'un salon : minuscules, chiffres, tirets. Le reste ne peut pas exister. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/*
 * Cette route lit `params` ET interroge l'API avant de peindre : elle ne peut pas
 * avoir de version prérendue, puisque le slug n'est connu qu'à la requête. Sans
 * cette ligne, le build tente un « shell » statique et échoue sur l'accès aux
 * données d'exécution (« Next.js encountered uncached or runtime data during
 * prerendering »). Même choix que la route attrape-tout du site, et pour la même
 * raison : une page dont le contenu dépend entièrement de l'URL se rend à la
 * demande, pas à la compilation.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const labels = dict.storefront;

  const lookup = SLUG_PATTERN.test(slug) ? await lookupSalon(slug) : ({ status: "missing" } as const);

  const alternates: Record<string, string> = {};
  for (const other of locales) {
    alternates[localeTags[other]] = localePath(other, `/s/${slug}`);
  }

  if (lookup.status !== "ok") {
    /* Salon inconnu : la page répond 404 (voir le rendu). Un salon injoignable :
       on garde un titre neutre, sans désindexer — la panne est peut-être passagère. */
    return {
      title: `${labels.breadcrumb} — ${dict.site.name}`,
      description: labels.notFoundBody,
      alternates: { canonical: localePath(lang, `/s/${slug}`), languages: alternates },
    };
  }

  const salon = lookup.salon;
  const title = `${salon.name}${salon.city ? ` — ${salon.city}` : ""}`;
  const description =
    salon.description ?? `${salon.name} · ${labels.bookOnline}${salon.city ? ` · ${salon.city}` : ""}`;
  const url = absoluteUrl(localePath(lang, `/s/${slug}`));

  /* Un salon sans logo n'a rien à proposer en image : mieux vaut aucune image
     déclarée qu'une image de Belora qui ferait passer la page pour la nôtre. */
  const images = salon.logo ? [salon.logo] : undefined;

  return {
    title,
    description,
    alternates: { canonical: localePath(lang, `/s/${slug}`), languages: alternates },
    openGraph: { type: "website", title, description, url, images },
    twitter: { card: "summary", title, description, images },
  };
}

export default async function SalonStorefrontRoute({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const labels = dict.storefront;

  /* Pas de `<Suspense>` autour de cette lecture, et c'est volontaire : la
     coquille partirait en 200 AVANT que le 404 ne soit connu, et la page
     introuvable serait un « soft 404 » — un 200 pour les moteurs. Ici la réponse
     attend la lecture (4 s au plus, voir `lookupSalon`) pour que le code HTTP
     dise la vérité. */
  if (!SLUG_PATTERN.test(slug)) notFound();

  const lookup = await lookupSalon(slug);
  if (lookup.status === "missing") notFound();

  if (lookup.status === "unreachable") {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
        <div className="max-w-md text-center">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink/40">
            {dict.site.name}
          </span>
          <h1 className="mt-4 font-light text-2xl leading-tight">{labels.unavailableTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">{labels.unavailableBody}</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {/* Recharger la page relance la lecture serveur : c'est le vrai « réessayer ». */}
            <a
              href={localePath(lang, `/s/${slug}`)}
              className="rounded-full bg-ink px-5 py-2.5 text-xs text-paper transition-opacity hover:opacity-85"
            >
              {labels.retry}
            </a>
            <a
              href={localePath(lang)}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-xs text-ink/70 transition-colors hover:border-ink/35"
            >
              {labels.backHome}
            </a>
          </div>
        </div>
      </main>
    );
  }

  const salon = lookup.salon;
  const url = absoluteUrl(localePath(lang, `/s/${slug}`));

  /* Le balisage décrit ce que la page affiche et rien de plus : nom, adresse
     publique, ville. Pas de prix, pas d'horaire, pas de note — ces données
     viennent de l'API et ne sont pas toutes stables au moment du rendu. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: salon.name,
    url,
    ...(salon.description ? { description: salon.description } : {}),
    ...(salon.logo ? { image: salon.logo } : {}),
    address: {
      "@type": "PostalAddress",
      ...(salon.city ? { addressLocality: salon.city } : {}),
      ...(salon.country ? { addressCountry: salon.country } : {}),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SalonPage slug={slug} salon={salon} />
    </>
  );
}


