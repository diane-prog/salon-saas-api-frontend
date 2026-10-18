import type { ReactNode } from "react";

import AmbientVideo from "@/components/AmbientVideo";

/**
 * Le hero des pages internes — désormais posé sur un plan vidéo.
 *
 * CE QUI A CHANGÉ : le hero était typographique, sans média (`bg-paper`, titre à l'encre).
 * Le premier écran d'une page interne ressemblait alors à une simple page de texte, alors
 * que l'accueil, lui, ouvre sur un plan plein cadre. Les deux ne parlaient pas la même
 * langue. Ici, toutes les pages internes prennent le même fond que l'accueil — un plan
 * vidéo, muet et en boucle — avec le même voile sombre, et le texte passe au papier.
 *
 * LE MÉDIA : `public/media/demo.mp4` est livré avec le dépôt (affiche : la première image
 * du plan, `public/media/demo-poster.jpg`), donc l'écran est fini sans configuration. Les
 * variables `NEXT_PUBLIC_PAGE_VIDEO` et `NEXT_PUBLIC_PAGE_PHOTO` les remplacent quand elles
 * sont posées (chemin local ou URL absolue).
 *
 * `HeroBackdrop` est exporté pour les pages qui dessinent leur propre ouverture
 * (`ServicePageTemplate`, Tarifs, Réalisations) : un seul endroit décrit le plan, le voile
 * et le grain, donc les quatre heros ne peuvent pas diverger.
 *
 * Aucune animation d'entrée : le hero est ce qu'on voit en premier, il n'a pas à se mériter.
 */
const VIDEO = process.env.NEXT_PUBLIC_PAGE_VIDEO ?? "/media/hero-about.mp4";
const PHOTO = process.env.NEXT_PUBLIC_PAGE_PHOTO ?? "/media/demo-poster.jpg";

/**
 * La hauteur d'ouverture, la même sur toutes les sous-pages.
 *
 * La référence est l'ouverture de `/services/agenda` : elle prenait toute la fenêtre (et un
 * peu plus, son contenu la poussant à ~790 px), là où À propos, Contact ou Réalisations
 * s'arrêtaient à mi-écran. Un plan vidéo dans une bande courte ne se lit pas comme un plan :
 * on voit une vignette. `svh` (et non `vh`) mesure la petite fenêtre sur téléphone, celle
 * qui reste quand la barre d'adresse est là — sinon le bas du titre passe sous elle.
 *
 * Le contenu est posé EN BAS du cadre, comme sur l'affiche de l'accueil : le plan respire
 * au-dessus, le texte se lit en bas. Exporté pour que les pages qui dessinent leur propre
 * ouverture ne puissent pas dériver de cette hauteur.
 */
export const HERO_HEIGHT = "min-h-svh";

/**
 * Le champ du hero : affiche, vidéo par-dessus, voile, grain. À poser dans une section
 * `relative isolate overflow-hidden bg-ink text-paper`.
 *
 * La vidéo s'arrête hors écran (voir `AmbientVideo`) et disparaît si la personne a demandé
 * moins d'animation : l'affiche reste alors seule, ce qui est le repli attendu.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-20">
      {PHOTO && (
        // eslint-disable-next-line @next/next/no-img-element -- média fourni avec le dépôt (chemin local ou URL), hors liste blanche de `next/image`
        <img
          src={PHOTO}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {VIDEO && (
        <AmbientVideo
          src={VIDEO}
          poster={PHOTO}
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        />
      )}

      {/* Le voile ne couvre plus que le BAS : le haut du plan reste intact, c'est lui qu'on
          vient voir. Le dégradé s'éteint complètement vers 76 % de la hauteur — au-dessus,
          aucune couche, le plan est à sa couleur. Le contenu étant posé en bas du cadre
          (voir `HERO_HEIGHT`), le titre tombe dans la partie encore protégée : 0,55 d'encre
          au niveau du texte, ce qui suffit sur un plan clair sans repeindre l'image. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(21,17,14,0.94)_0%,rgba(21,17,14,0.84)_28%,rgba(21,17,14,0.55)_48%,rgba(21,17,14,0.18)_66%,rgba(21,17,14,0)_76%)]" />

      {/* Le voile de TÊTE, celui de la barre transparente : le haut du plan est clair
          (183 à 210 sur 255 mesurés dans la bande du nom, sur le fichier livré), un nom en
          papier n'y tenait pas. Il s'éteint avant le quart haut, donc le plan reste à sa
          couleur partout où il n'y a rien à lire. */}
      <div className="absolute inset-x-0 top-0 h-[30vh] bg-[linear-gradient(to_bottom,rgba(21,17,14,0.62)_0%,rgba(21,17,14,0.42)_34%,rgba(21,17,14,0.16)_68%,rgba(21,17,14,0)_100%)]" />

      {/* Le grain vit dans son propre cadre : `grain` pose `position: relative`, ce qui
          écraserait l'`absolute` du calque. */}
      <div className="absolute inset-0">
        <div className="grain h-full w-full" />
      </div>
    </div>
  );
}

export function HeroSection({
  eyebrow,
  title,
  highlight,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  /** Chapô sous le titre. Optionnel : certaines pages portent leur ouverture plus bas. */
  body?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={`relative isolate flex ${HERO_HEIGHT} flex-col justify-end overflow-hidden bg-ink pb-14 pt-32 text-paper sm:pb-20 sm:pt-40`}
    >
      <HeroBackdrop />

      <div className="container-x relative">
        <div className="grid gap-8 border-b border-paper/15 pb-12 lg:grid-cols-12 lg:gap-12 lg:pb-16">
          <div className="lg:col-span-3">
            <span className="text-[0.66rem] uppercase tracking-[0.2em] text-paper/75">{eyebrow}</span>
            <span aria-hidden className="mt-4 block h-px w-12 bg-paper/30" />
          </div>

          <div className="lg:col-span-9">
            <h1 className="max-w-[22ch] font-display text-[clamp(2.5rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.02em] text-paper">
              {title}
              {highlight ? (
                <>
                  {" "}
                  <em className="text-brand">{highlight}</em>
                </>
              ) : null}
            </h1>

            {body && (
              <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-paper/70 sm:text-[1.1rem]">
                {body}
              </p>
            )}

            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
