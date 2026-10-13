import Image from "next/image";
import { ButtonLink } from "@/components/ui";
/* Ce fichier est rendu HORS layout (aucune autre feuille de styles ne l'atteint) :
   sans cet import, la page de secours s'afficherait entièrement non stylée. */
import "./globals.css";

export default function NotFound() {
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
        <h1 className="text-3xl text-navy sm:text-4xl">Page introuvable</h1>
        <p className="max-w-md text-base text-muted">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/fr" variant="outline">Français</ButtonLink>
          <ButtonLink href="/en" variant="outline">English</ButtonLink>
        </div>
      </div>
    </section>
  );
}
