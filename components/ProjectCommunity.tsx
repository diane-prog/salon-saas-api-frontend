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
      className="relative overflow-clip pt-10 pb-16 sm:pt-12 sm:pb-20"
      style={
        {
          background: "linear-gradient(160deg, #c9d8e3 0%, #dfe8ef 45%, #d3dfe8 100%)",
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

      {/* En-tête : titre NU sur deux lignes, puis la galerie (fiches collantes). */}
      <div className="relative mx-auto max-w-[80rem] px-6 pt-2">
        <h2 className="text-4xl leading-[1.14] text-navy sm:text-5xl">
          <span className="block">{words.slice(0, splitAt).join(" ")}</span>
          <span className="block text-navy/50">{words.slice(splitAt).join(" ")}</span>
        </h2>

        <span className="mt-8 inline-block text-[0.68rem] font-medium uppercase tracking-[0.24em] text-navy/45">
          {ui.portfolio}
        </span>
      </div>

      <div className="relative mx-auto max-w-[80rem] px-6">
        <ProjectsGallery projects={projects} views={["feed"]} stickyFeed />
      </div>
    </section>
  );
}
