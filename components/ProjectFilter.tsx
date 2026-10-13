"use client";

import { useMemo, useState } from "react";
import ProjectsGallery, {
  ALL_VIEWS,
  GalleryViewSelect,
  type GalleryProject,
  type GalleryView,
} from "@/components/ProjectsGallery";
import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Réalisations (page dédiée) : la barre d'outils, puis la galerie.
 *
 * La barre tient sur UNE ligne : à gauche les catégories, à droite le choix d'affichage — et
 * ce choix tient dans un seul contrôle (« Affichage — Grille ») qui ouvre un menu, au lieu de
 * quatre onglets de plus. Avant, la barre portait deux séries de petites capitales côte à
 * côte, sans rien pour dire laquelle était le filtre : on lisait tout d'un trait, comme une
 * seule longue liste de mots.
 *
 * Le compteur, lui, est passé en exposant : un petit nombre à l'anglaise, aligné en haut du
 * libellé et non plus collé derrière (« Branding01 »). On sait ce qu'on va voir avant de
 * cliquer, sans que le chiffre se confonde avec le mot.
 *
 * La vue est tenue ici (`view`) et descendue dans la galerie : c'est ce qui permet à la
 * barre d'outils et à la galerie de partager le même état tout en restant deux composants.
 */
export default function ProjectFilter({ projects }: { projects: GalleryProject[] }) {
  const { dict } = useDictionary();
  const filters = dict.filters;
  const [active, setActive] = useState(filters[0]);
  const [view, setView] = useState<GalleryView>(ALL_VIEWS[0]);

  /* Les compteurs sont calculés sur la liste complète, une fois : ils ne dépendent pas de
     la sélection, ils l'éclairent. */
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const filter of filters) {
      map.set(
        filter,
        filter === filters[0] ? projects.length : projects.filter((p) => p.category === filter).length,
      );
    }
    return map;
  }, [filters, projects]);

  const visible = useMemo(
    () => (active === filters[0] ? projects : projects.filter((p) => p.category === active)),
    [active, filters, projects],
  );

  return (
    <div>
      <div
        className={`flex flex-wrap items-baseline justify-between gap-x-14 gap-y-5 border-t pt-5 ${RULE}`}
      >
        {/* ——— Colonne gauche : ce qu'on regarde. ——— */}
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          {filters.map((filter) => {
            const current = active === filter;
            const count = counts.get(filter) ?? 0;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActive(filter)}
                aria-pressed={current}
                className="group relative flex items-baseline gap-2 pb-1.5"
              >
                <span
                  className={`${LABEL} transition-colors duration-300 ${
                    current ? "text-ink" : "text-ink/40 group-hover:text-ink/70"
                  }`}
                >
                  {filter}
                </span>
                <span
                  className={`-translate-y-[0.25em] text-[0.58rem] font-medium tabular-nums tracking-[0.14em] transition-colors duration-300 ${
                    current ? "text-ink/45" : "text-ink/25 group-hover:text-ink/45"
                  }`}
                >
                  {String(count).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-300 ${
                    current ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ——— Colonne droite : comment on le regarde. Le filet vertical n'apparaît que
            lorsque les deux groupes tiennent sur la même ligne. ——— */}
        <GalleryViewSelect
          views={ALL_VIEWS}
          view={view}
          onSelect={setView}
          className="lg:border-l lg:border-navy/10 lg:pl-10"
        />
      </div>

      {visible.length > 0 ? (
        <ProjectsGallery projects={visible} view={view} />
      ) : (
        <p className={`mt-14 border-t pt-6 ${RULE} text-[0.95rem] text-ink/60`}>
          {dict.ui.searchNoResults}
        </p>
      )}
    </div>
  );
}
