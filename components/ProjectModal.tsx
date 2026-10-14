"use client";

import Image from "next/image";
import Link from "next/link";
import FullScreenPanel from "@/components/FullScreenPanel";
import { useDictionary } from "@/components/DictionaryProvider";
import { ArrowRight } from "@/components/Icons";
import { BODY, LABEL } from "@/lib/editorial";
import type { GalleryProject } from "@/components/ProjectsGallery";

/**
 * Filet du panneau. On reprend la typographie du vocabulaire « galerie » (`LABEL`, `BODY`) —
 * elle ne porte aucune couleur, elle est donc valable partout — mais PAS son `RULE` : celui-ci
 * est un `navy` à 10 %, pensé pour le papier, et il disparaîtrait sur l'encre. Ici c'est le
 * filet des autres panneaux plein écran : le papier à 12 %.
 */
const RULE_ON_INK = "border-paper/12";

/**
 * Fiche d'une réalisation, en plein écran.
 *
 * POURQUOI ELLE EXISTE : dans la galerie, chaque carte menait à `/{langue}/realisations` —
 * c'est-à-dire, depuis cette page, à elle-même. Le clic ne produisait donc rien de visible :
 * on cliquait sur une image pour arriver là où on était déjà. La carte ouvre désormais le
 * projet. Le clic ne change pas de page, il DÉPLIE ce qu'on regardait.
 *
 * LA MÉCANIQUE EST CELLE DU RESTE DU SITE : le panneau plein écran de la recherche, du
 * formulaire de contact et du méga menu Services — encre pleine, logo clair, croix cerclée,
 * Échap, Tab contenu, page figée, retour du focus sur la carte ouverte. Rien n'est réinventé :
 * un projet se lit comme se lit une recherche, et le visiteur retrouve ses repères.
 *
 * `tone="ink"` et non le verre par défaut : la fiche est un objet de lecture (une image et du
 * texte), pas un survol de navigation. Le verre laisserait la galerie derrière le texte, qui
 * est déjà clair sur clair tant qu'on n'a pas fait le tour.
 *
 * La mise en page reprend le vocabulaire « galerie » du site : filets fins, lignes numérotées
 * pour le périmètre (comme la table des services et les engagements du devis), aucun arrondi,
 * aucune ombre, un seul accent — le bleu de marque.
 */
export default function ProjectModal({
  project,
  onClose,
  returnFocusTo,
}: {
  project: GalleryProject;
  onClose: () => void;
  /** Carte qui a ouvert la fiche : elle reprend le focus à la fermeture. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const { dict, locale } = useDictionary();
  const { ui } = dict;
  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  return (
    <FullScreenPanel
      tone="ink"
      /* Le nom du dialogue dit d'abord de quoi il s'agit, puis de quoi : « Détail du
         projet — Setna Services ». Un lecteur d'écran qui saute de panneau en panneau sait
         ainsi toujours ce qu'il vient d'ouvrir. */
      label={`${ui.projectDetailLabel} — ${project.title}`}
      closeLabel={ui.projectCloseLabel}
      onClose={onClose}
      returnFocusTo={returnFocusTo}
      footer={
        <>
          <span>{ui.projectCta}</span>
          <Link
            href={href("/devis")}
            className="group inline-flex items-center gap-2 text-turquoise transition-colors duration-300 hover:text-paper"
          >
            {ui.dock.quote}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </>
      }
    >
      {/* `data-lenis-prevent` : Lenis écoute la molette sur tout le document — sans cet
          attribut, faire défiler le texte de la fiche ferait défiler la page derrière elle.
          Même règle que la liste de résultats de la recherche et les formulaires. */}
      <div
        data-lenis-prevent
        className="no-scrollbar container-x flex flex-1 flex-col overflow-y-auto overscroll-contain pb-14"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* L'image d'abord, à gauche : c'est elle qu'on a cliquée. */}
          <div
            data-panel-in
            className="relative aspect-[4/3] w-full overflow-hidden bg-paper/5 lg:aspect-[4/5]"
          >
            <Image
              src={project.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-10">
            <div data-panel-in>
              <span className={`${LABEL} text-turquoise`}>{project.category}</span>
              <h2 className="mt-4 text-3xl font-light leading-[1.1] text-paper sm:text-4xl">
                {project.title}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-paper/70">{project.summary}</p>
            </div>

            {/* Le périmètre, en lignes numérotées séparées par des filets : la même table que
                les engagements de la page devis. Le numéro ordonne sans rien décorer. */}
            <div data-panel-in>
              <span className={`${LABEL} text-paper/40`}>{ui.projectDeliverables}</span>
              <ul className={`mt-4 border-t ${RULE_ON_INK}`}>
                {project.scope.map((line, index) => (
                  <li
                    key={line}
                    className={`flex items-baseline gap-4 border-b py-3.5 text-[0.95rem] text-paper/85 ${RULE_ON_INK}`}
                  >
                    <span className="w-5 shrink-0 text-xs tabular-nums text-paper/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Client et catégorie : les deux faits vérifiables du projet, à part du récit. */}
            <dl data-panel-in className="flex flex-wrap gap-x-12 gap-y-5 border-t border-paper/10 pt-6">
              <div>
                <dt className={`${LABEL} text-paper/40`}>{ui.projectClient}</dt>
                <dd className={`mt-2 ${BODY} text-paper`}>{project.client}</dd>
              </div>
              <div>
                <dt className={`${LABEL} text-paper/40`}>{ui.projectCategory}</dt>
                <dd className={`mt-2 ${BODY} text-paper`}>{project.category}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
