import { Suspense } from "react";
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
 * D'où la découpe : le « 404 » et les deux liens de langue — qui ne dépendent PAS de
 * la langue, puisque les noms de langue s'écrivent dans leur langue — sont dans la coquille
 * prérendue. Seuls le titre et la phrase sont isolés dans la frontière, avec pour repli le
 * texte de la langue par défaut : la page est donc complète avant même que la requête ne soit
 * lue, puis le texte se remplace s'il y a lieu. Un `not-found` ne peut pas être plus tardif
 * que le reste de la page.
 */
export default function NotFound() {
  return (
    /* Page introuvable : plus de photo d'ambiance ni de voile noir. Une grande encre, un
       filet de laiton, une phrase — la même main que le reste du site. Le « 404 » est
       décoratif (`aria-hidden`) : le titre, lui, se lit. */
    <section className="relative flex min-h-[80vh] items-center bg-paper pt-32 pb-24 text-ink">
      <div className="container-x relative flex flex-col items-start gap-6">
        <span aria-hidden className="font-display text-[clamp(4rem,16vw,9rem)] leading-[0.8] text-ink/15">
          404
        </span>
        <span aria-hidden className="h-px w-12 bg-brand/70" />
        <Suspense
          fallback={
            <Notice title={defaultDict.ui.notFoundTitle} body={defaultDict.ui.notFoundBody} />
          }
        >
          <LocalizedNotice />
        </Suspense>
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

/** Lit la langue de la requête, puis le dictionnaire correspondant. */
async function LocalizedNotice() {
  const [store, head] = await Promise.all([cookies(), headers()]);
  const dict = await getDictionary(
    detectLocale(store.get("belora-locale")?.value, head.get("accept-language") ?? undefined),
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
      <h1 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.015em]">
        {title}
      </h1>
      <p className="max-w-md text-[0.98rem] leading-relaxed text-ink/60">{body}</p>
    </>
  );
}
