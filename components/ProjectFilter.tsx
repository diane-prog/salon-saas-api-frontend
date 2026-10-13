"use client";

import { useMemo, useState } from "react";
import ProjectsGallery, { type GalleryProject } from "@/components/ProjectsGallery";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Réalisations (page dédiée) : le filtre par catégorie, puis la galerie avec TOUS les
 * affichages — Grille, Liste, Fil, Plein cadre. C'est la seule page qui les propose
 * tous ; l'accueil de son côté ne garde que la vue « Fil » (voir `ProjectCommunity`).
 *
 * Le filtre restreint la liste passée à la galerie : chaque affichage travaille alors sur
 * la sélection courante (la pile « Fil » se recalcule d'elle-même sur son nombre de fiches).
 * Le sur-titre « Portfolio » est retiré ici (`label={null}`) : la page porte déjà son titre.
 */
export default function ProjectFilter({ projects }: { projects: GalleryProject[] }) {
  const { dict } = useDictionary();
  const filters = dict.filters;
  const [active, setActive] = useState(filters[0]);

  const visible = useMemo(
    () => (active === filters[0] ? projects : projects.filter((p) => p.category === active)),
    [active, filters, projects],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            aria-pressed={active === f}
            className={`rounded-full px-5 py-2.5 text-sm font-light transition-all duration-300 ${
              active === f
                ? "bg-gradient-to-r from-brand to-turquoise text-white shadow-soft"
                : "bg-white text-navy ring-1 ring-navy/10 hover:ring-brand hover:text-brand"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <ProjectsGallery projects={visible} label={null} />
      ) : (
        <p className="mt-14 text-center text-sm text-muted">No projects in this category yet.</p>
      )}
    </div>
  );
}
