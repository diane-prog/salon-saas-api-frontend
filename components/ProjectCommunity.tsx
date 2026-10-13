"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations (accueil) : la liste des projets façon « Selected Works » — un titre,
 * une barre de choix d'affichage (Grille / Liste / Fil / Plein cadre) et les projets
 * dessous, rendus selon la vue choisie. Le fond de la section est inchangé.
 *
 * Conforme à la référence : AUCUN cadre, AUCUN arrondi, aucune ligne. Les vignettes
 * sont des images nues posées sur le fond, séparées par une simple gouttière ; le
 * titre et la catégorie n'apparaissent qu'au survol (au repos, l'image seule), de même
 * que la pastille flèche. C'est aussi plus lisible au clavier : `group-focus-visible`
 * déclenche les mêmes révélations qu'un survol.
 *
 * Les quatre vues se lisent comme suit :
 * - `grid` (défaut) : la planche de vignettes de la référence, régulière, 2 colonnes sur
 *   mobile puis 3 par ligne.
 * - `list`  : un sommaire — numéro, vignette, titre, catégorie — une ligne par projet.
 * - `feed`  : un empilement de fiches — chaque visuel se colle sous le précédent, la
 *   fiche suivante le recouvre et il rentre légèrement sur lui-même (relief de
 *   profondeur piloté par le défilement, voir `.stack-card` dans globals.css).
 * - `full`  : les mêmes vignettes en plein cadre, bord à bord.
 *
 * Le choix vit dans l'état du composant (aucun rechargement, aucun paramètre d'URL) et
 * les vues sont remontées à chaque changement (`key`) pour rejouer la révélation.
 */

type View = "grid" | "list" | "feed" | "full";

const VIEWS: View[] = ["grid", "list", "feed", "full"];

export default function ProjectCommunity() {
  const { dict, locale } = useDictionary();
  const { projects, ui } = dict;
  const [view, setView] = useState<View>("grid");

  const words = ui.projectsHeading.split(/\s+/).filter(Boolean);
  const splitAt = Math.max(2, Math.ceil(words.length / 2));
  const flush = view === "full";

  return (
    <section
      /* `overflow-clip` et non `overflow-hidden` : un ancêtre `overflow: hidden` crée un
         conteneur de défilement qui n'en défile pas moins, et le `sticky` de la vue
         « Fil » ne se collerait plus (même convention que la section services). */
      className="relative overflow-clip pt-10 sm:pt-12"
      style={
        {
          background:
            "linear-gradient(160deg, #c9d8e3 0%, #dfe8ef 45%, #d3dfe8 100%)",
        } as React.CSSProperties
      }
    >
      {/* Fond : l'image floutée COUVRE TOUTE la section + un voile clair qui unifie. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/hero3.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              transform: "scale(1.2)",
              filter: "blur(80px)",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[#e8eef4]/65" />
      </div>

      {/* En-tête : titre NU sur deux lignes, puis la barre des affichages. */}
      <div className="relative mx-auto max-w-[80rem] px-6 pt-2">
        <h2 className="text-4xl leading-[1.14] text-navy sm:text-5xl">
          <span className="block">{words.slice(0, splitAt).join(" ")}</span>
          <span className="block text-navy/50">{words.slice(splitAt).join(" ")}</span>
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-navy/45">
            {ui.portfolio}
          </span>

          <div
            role="group"
            aria-label={ui.galleryViewLabel}
            className="flex items-center justify-between gap-7 sm:justify-start sm:gap-10"
          >
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`relative pb-1 text-sm font-light transition-colors duration-300 ${
                  view === v ? "text-navy" : "text-muted hover:text-navy"
                }`}
              >
                {ui.galleryViews[v]}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-navy transition-transform duration-300 ${
                    view === v ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        key={view}
        className={
          flush
            ? "relative mt-10 pb-16 sm:pb-20"
            : "relative mx-auto mt-10 max-w-[80rem] px-6 pb-16 sm:pb-20"
        }
      >
        {view === "grid" ? (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title} delay={i * 60}>
                <Tile
                  href={`/${locale}/realisations`}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  className="aspect-[4/5]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}

        {view === "list" ? (
          <ul className="flex flex-col gap-2">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title}>
                <Link
                  href={`/${locale}/realisations`}
                  className="group flex items-center gap-4 px-3 py-4 transition-colors duration-300 hover:bg-white/45 sm:gap-6 sm:px-5"
                >
                  <span className="w-6 shrink-0 text-xs tabular-nums text-navy/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-navy/10 sm:h-16 sm:w-16">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-light text-navy">
                      {project.title}
                    </span>
                    <span className="mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted">
                      {project.category}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-navy/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy" />
                </Link>
              </Reveal>
            ))}
          </ul>
        ) : null}

        {/* Vue « Fil » : l'empilement. Pas de `Reveal` ici — son fondu au scroll pose un
            `transform` sur l'ancêtre de la fiche, ce qui la priverait de son `sticky`. */}
        {view === "feed" ? (
          <ul className="relative">
            {projects.map((project, i) => (
              <li key={project.title} className="stack-frame">
                <div
                  className="stack-card"
                  style={{ top: `calc(4.5rem + ${i} * 0.75rem)`, zIndex: i + 1 }}
                >
                  <Tile
                    href={`/${locale}/realisations`}
                    title={project.title}
                    category={project.category}
                    image={project.image}
                    className="aspect-[4/5] sm:aspect-auto sm:h-[calc(100svh-12rem)]"
                    sizes="(min-width: 80rem) 80rem, 100vw"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {view === "full" ? (
          <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.title} delay={i * 50}>
                <Tile
                  href={`/${locale}/realisations`}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  className="aspect-square"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Vignette : image nue (aucun cadre, aucun arrondi). Le survol — ou la prise de focus,
 * pour le clavier — fait apparaître un léger voile, le titre, la catégorie et la flèche.
 */
function Tile({
  href,
  title,
  category,
  image,
  className,
  sizes,
}: {
  href: string;
  title: string;
  category: string;
  image: string;
  className: string;
  sizes: string;
}) {
  const reveal =
    "opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100";

  return (
    <Link
      href={href}
      className={`group relative block w-full overflow-hidden bg-navy/[0.06] ${className}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <span
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent ${reveal}`}
      />

      <span
        aria-hidden
        className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ${reveal}`}
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>

      <span
        className={`absolute inset-x-4 bottom-4 translate-y-2 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 ${reveal}`}
      >
        <span className="block text-sm font-light leading-snug text-white sm:text-base">
          {title}
        </span>
        <span className="mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/70">
          {category}
        </span>
      </span>
    </Link>
  );
}
