import { Suspense } from "react";
import Image from "next/image";
import { cookies, headers } from "next/headers";
import { ButtonLink } from "@/components/ui";
import {
  detectLocale,
  getDictionary,
  locales,
  localeNames,
  localePath,
} from "@/lib/dictionaries";
/* Le dictionnaire par défaut, importé STATIQUEMENT : il ne sert qu'au repli prérendu (voir
   plus bas), et un import statique ne bloque rien — contrairement à `cookies()`. */
import * as defaultDict from "@/lib/dictionaries/fr";
/* Ce fichier est rendu HORS layout (aucune autre feuille de styles ne l'atteint) :
   sans cet import, la page de secours s'afficherait entièrement non stylée. */
import "./globals.css";

/**
 * Page de secours pour un chemin SANS langue. En pratique le proxy en redirige la quasi
 * totalité vers `/{langue}{chemin}` — c'est donc `app/[lang]/not-found.tsx` qui répond
 * presque toujours. Celle-ci n'existe que pour les cas limites.
 *
 * LA COQUILLE EST STATIQUE, LE TEXTE ARRIVE EN FLUX. Sa langue doit se DÉDUIRE de la requête
 * (cookie, puis `Accept-Language`, puis langue par défaut) : elle ne reçoit aucun paramètre
 * de route, donc rien d'autre à lire. Or lire la requête (`cookies()`, `headers()`) est un
 * accès à des données d'exécution : avec Cache Components (`cacheComponents: true`, voir
 * next.config.ts) un tel accès HORS frontière `<Suspense>` empêche la route d'être prérendue
 * et fait échouer le build.
 *
 * D'où la découpe : l'image, le « 404 » et les deux liens de langue — qui ne dépendent PAS de
 * la langue, puisque les noms de langue s'écrivent dans leur langue — sont dans la coquille
 * prérendue. Seuls le titre et la phrase sont isolés dans la frontière, avec pour repli le
 * texte de la langue par défaut : la page est donc complète avant même que la requête ne soit
 * lue, puis le texte se remplace s'il y a lieu. Un `not-found` ne peut pas être plus tardif
 * que le reste de la page.
 */
export default function NotFound() {
  return (
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

        <Suspense
          fallback={
            <Notice title={defaultDict.ui.notFoundTitle} body={defaultDict.ui.notFoundBody} />
          }
        >
          <LocalizedNotice />
        </Suspense>

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

/** Lit la langue de la requête, puis le dictionnaire correspondant. */
async function LocalizedNotice() {
  const [store, head] = await Promise.all([cookies(), headers()]);
  const dict = await getDictionary(
    detectLocale(store.get("leegi-locale")?.value, head.get("accept-language") ?? undefined),
  );
  return <Notice title={dict.ui.notFoundTitle} body={dict.ui.notFoundBody} />;
}

/**
 * Le titre et la phrase, présentés à l'identique dans les deux langues d'arrivée. Les libellés
 * sont passés en clair plutôt que le dictionnaire entier : c'est tout ce que cette partie
 * utilise, et le repli prérendu n'a donc besoin que de deux chaînes.
 */
function Notice({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h1 className="text-3xl text-navy sm:text-4xl">{title}</h1>
      <p className="max-w-md text-base text-muted">{body}</p>
    </>
  );
}
