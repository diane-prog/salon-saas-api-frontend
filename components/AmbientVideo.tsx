"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

type AmbientVideoProps = {
  src: string;
  poster?: string;
  className?: string;
};

/** Type MIME déduit de l'extension : un `.webm` annoncé en `mp4` n'est pas lu par Safari. */
export function videoMimeType(src: string): string {
  if (src.endsWith(".webm")) return "video/webm";
  if (src.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

/**
 * Vidéo d'ambiance : muette, en boucle, sans commandes — un plan, pas un lecteur.
 *
 * ELLE NE TOURNE QUE PENDANT QU'ELLE EST À L'ÉCRAN. Une vidéo en lecture continue de
 * décoder et de recomposer ses images même quand on l'a dépassée : sur une page qui fait
 * sept écrans, c'est un coût permanent pendant tout le défilement, et c'est le genre de
 * charge qui fait sauter une image par-ci par-là sur une machine modeste. L'observateur la
 * met en pause dès qu'elle sort du champ (avec 200 px de marge, pour qu'elle soit déjà en
 * marche au moment d'y arriver) et la relance au retour.
 *
 * `prefers-reduced-motion` la laisse arrêtée sur son affiche : chez ces visiteurs, une
 * vidéo qui bouge est exactement ce que le réglage refuse — la cacher ne suffisait pas, il
 * fallait aussi cesser de la décoder.
 */
export default function AmbientVideo({ src, poster, className = "" }: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      /* L'attribut est retiré, pas seulement la lecture : `autoplay` relance la vidéo dès
         que le média est prêt, et ce réglage-là ne se négocie pas. */
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          /* La promesse est rejetée si le navigateur refuse la lecture (économie
             d'énergie, par exemple) : l'affiche reste alors seule, ce qui est le repli
             attendu — rien à signaler. */
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
      tabIndex={-1}
    >
      <source src={src} type={videoMimeType(src)} />
    </video>
  );
}
