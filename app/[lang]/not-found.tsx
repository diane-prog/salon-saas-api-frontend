import Image from "next/image";
import { ButtonLink } from "@/components/ui";
import { getDictionary, locales, localePath } from "@/lib/dictionaries";

export default async function NotFound() {
  const dict = await getDictionary(locales[0]);
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
              {l === "fr" ? "Accueil" : "Home"}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
