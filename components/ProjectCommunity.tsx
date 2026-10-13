"use client";

import Image from "next/image";
import ProjectsGallery from "@/components/ProjectsGallery";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations (accueil) : le titre de section, puis les projets.
 *
 * L'accueil ne garde qu'UN affichage — la vue « Fil » — d'où `views={["feed"]}` : aucun
 * choix à proposer. Et c'est ici, et seulement ici, que les fiches se collent (`stickyFeed`) :
 * la pile est l'effet de l'accueil, pas celui de la page Réalisations, qui demande les mêmes
 * cartes posées simplement l'une sous l'autre. Le fond de la section est inchangé.
 *
 * La galerie elle-même vit dans `ProjectsGallery`, partagée avec la page Réalisations :
 * la vue « Fil », ses réglages de pile et l'effet GSAP/ScrollTrigger y sont décrits.
 * `overflow-clip` et non `overflow-hidden` sur la section : un ancêtre `overflow: hidden`
 * crée un conteneur de défilement qui n'en défile pas moins, et le `sticky` des fiches ne
 * se collerait plus (même convention que la section services).
 */
export default function ProjectCommunity() {
  const { dict } = useDictionary();
  const { projects, ui } = dict;

  const words = ui.projectsHeading.split(/\s+/).filter(Boolean);
  const splitAt = Math.max(2, Math.ceil(words.length / 2));

  return (
    <section
      className="relative overflow-clip"
      style={
        {
          background: "linear-gradient(160deg, #c9d8e3 0%, #dfe8ef 45%, #d3dfe8 100%)",
        } as React.CSSProperties
      }
    >
      {/* Fond : l'image floutée COUVRE TOUTE la section + un voile clair qui unifie.

          L'image floutée à 80 px est MASQUÉE sur téléphone : recomposer un plein écran de
          flou à chaque frame coûte cher sur un GPU de poche, et le fond du dessous
          (le dégradé de la section) suffit — le voile par-dessus, lui, reste à toutes les
          largeurs, c'est lui qui unifie le fond. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 hidden sm:block">
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

      {/* Le CADRE : deux filets VERTICAUX qui tiennent la colonne de contenu, exactement
          comme le cadre de la section services (`border-x` + même `max-w-[80rem]`). Ici la
          section est claire : le filet est celui de tout le site (`navy/10`) au lieu du
          blanc des vidéos. Même dessin, même largeur de colonne, une autre lumière.

          Un SEUL cadre pour la section : l'en-tête et la galerie vivent dedans, sinon les
          filets se couperaient entre le titre et les fiches. */}
      <div className="relative mx-auto w-full max-w-[80rem] border-x border-navy/10">
        {/* En-tête : titre NU sur deux lignes, puis la galerie (fiches collantes).

            L'espace du haut est ICI, à l'intérieur du cadre, et non sur la section : les
            filets verticaux montent donc jusqu'au bord haut de la section au lieu de
            commencer 40 px plus bas. Même convention que la section services, dont le cadre
            encadre la colonne de haut en bas. */}
        <div className="relative px-6 pt-12 sm:pt-14">
          <h2 className="text-4xl leading-[1.14] text-navy sm:text-5xl">
            <span className="block">{words.slice(0, splitAt).join(" ")}</span>
            <span className="block text-navy/50">{words.slice(splitAt).join(" ")}</span>
          </h2>

          <span className="mt-8 inline-block text-[0.68rem] font-medium uppercase tracking-[0.24em] text-navy/45">
            {ui.portfolio}
          </span>
        </div>

        <div className="relative px-6 pb-16 sm:pb-20">
          <ProjectsGallery projects={projects} views={["feed"]} stickyFeed />
        </div>
      </div>
    </section>
  );
}
