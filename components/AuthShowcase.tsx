"use client";

import { useEffect, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Le fond de la colonne d'accès : un carrousel d'images, révélées par un BALAYAGE.
 *
 * POURQUOI CE MOUVEMENT, ET PAS UN FONDU : la colonne portait un aplat d'encre avec un
 * grand « B » en filigrane. Beau, mais mort — et la page de connexion est le premier écran
 * qu'un salon voit de nous. Un fondu d'une image à l'autre se lit comme un diaporama : on
 * voit deux images se superposer. Ici, l'image suivante ARRIVE en découvrant la précédente
 * (`clip-path` qui part du bord droit et balaie vers la gauche, 1,4 s, courbe d'entrée et de
 * sortie franches) : le regard suit une ligne, pas une dissolution.
 *
 * LES IMAGES SONT TOUTES MONTÉES, empilées par `z-index`. C'est ce qui permet le balayage :
 * la nouvelle image glisse PAR-DESSUS l'ancienne, qui reste visible dessous pendant le
 * mouvement. L'image active reçoit l'animation par un remontage (`key`) — aucune minuterie
 * par image, aucune coordonnée calculée en JavaScript, donc rien à recalculer au
 * redimensionnement.
 *
 * ELLES SONT LIVRÉES AVEC LE DÉPÔT (`public/media/`) et remplacées par
 * `NEXT_PUBLIC_AUTH_IMAGES` (liste séparée par des virgules, chemins locaux ou URL
 * absolues). Elles sont décoratives : `aria-hidden`, aucun texte alternatif.
 *
 * DEUX ARRÊTS PROPRES : rien ne tourne si l'onglet est en arrière-plan (une animation
 * plein cadre dans un onglet caché, c'est du travail pour personne), et rien ne tourne si
 * la personne a demandé moins d'animations — dans ce cas la première image reste, fixe.
 */
const DEFAULT_IMAGES = "/media/why.jpg,/media/demo.jpg,/media/hero.jpg";

const IMAGES = (process.env.NEXT_PUBLIC_AUTH_IMAGES ?? DEFAULT_IMAGES)
  .split(",")
  .map((source) => source.trim())
  .filter(Boolean);

/** Temps de pose d'une image, balayage compris (1,2 s dans `globals.css`). */
const HOLD_MS = 5200;

export default function AuthShowcase() {
  const [active, setActive] = useState(0);
  /* Compteur de tours : c'est lui qui donne son `z-index` à l'image active. Plus grand à
     chaque passage, donc l'image qui entre passe toujours au-dessus — y compris au retour
     de la dernière à la première, où un `z-index` fixe l'aurait laissée dessous. */
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (IMAGES.length < 2 || prefersReducedMotion()) return;

    let timer = 0;

    const start = () => {
      timer = window.setInterval(() => {
        setActive((current) => (current + 1) % IMAGES.length);
        setRun((current) => current + 1);
      }, HOLD_MS);
    };

    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    /* `isolate` : les `z-index` internes (images, voile, grain) restent DANS ce cadre et ne
       peuvent pas passer devant le texte de la colonne, qui vient après dans le DOM. Sans
       lui, le voile à `z-50` recouvrait la promesse et la liste des garanties. */
    <div aria-hidden className="absolute inset-0 isolate overflow-hidden bg-ink">
      {IMAGES.map((source, index) => {
        const isActive = index === active;

        return (
          <div
            key={source}
            className="absolute inset-0"
            style={{ zIndex: isActive ? IMAGES.length + run : index }}
          >
            {/* Deux animations sur deux éléments, jamais sur le même : le BALAYAGE
                (`clip-path`) découvre le cadre, la DÉRIVE (échelle) anime l'image à
                l'intérieur. Superposées sur un seul élément, la seconde aurait écrasé la
                première (`animation` est une propriété raccourcie).

                Le remontage par `key` est ce qui rejoue les deux : la clé change à
                l'instant où l'image devient active, et seulement là. */}
            <div
              key={isActive ? `active-${run}` : source}
              className={`absolute inset-0 ${isActive ? "auth-wipe" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- images fournies par l'exploitant (chemins locaux ou URL), hors liste blanche de `next/image` */}
              <img
                src={source}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "low"}
                className={`h-full w-full object-cover ${isActive ? "auth-drift" : ""}`}
              />
            </div>
          </div>
        );
      })}

      {/* Le voile : il tient le texte de la colonne lisible SUR les images, sans les
          éteindre — plus dense en bas (où vit la promesse), à peine posé en haut. */}
      <div className="absolute inset-0 z-50 bg-[linear-gradient(to_top,rgba(21,17,14,0.94)_0%,rgba(21,17,14,0.72)_38%,rgba(21,17,14,0.42)_72%,rgba(21,17,14,0.3)_100%)]" />

      {/* Le grain dans son propre cadre : `grain` pose `position: relative`. */}
      <div className="absolute inset-0 z-50">
        <div className="grain h-full w-full" />
      </div>
    </div>
  );
}
