"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import AmbientVideo from "@/components/AmbientVideo";
import { useDictionary } from "@/components/DictionaryProvider";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Hero de l'accueil — une AFFICHE plein cadre, pas un bandeau de fonctionnalités.
 *
 * POURQUOI CETTE FORME : la version précédente posait le texte à gauche et une carte
 * d'agenda à droite. C'était lisible, mais ça ressemblait à une page produit parmi
 * d'autres : le premier écran annonçait une fonctionnalité avant d'annoncer une maison.
 * Ici la composition est celle d'une couverture — une seule surface plein cadre, et quatre
 * ancrages, comme sur une affiche :
 *
 *   - à droite, une phrase courte et l'unique bouton (ce qu'on peut faire tout de suite) ;
 *   - à gauche, au-dessus du titre, trois lignes de petites capitales (ce que c'est) ;
 *   - en bas à gauche, le titre, très grand, sur deux lignes (ce qu'on retient) ;
 *   - en bas, le vocabulaire du produit et la maison (ce qu'on signe).
 *
 * LE MÉDIA : un fichier est livré AVEC le dépôt — `public/media/hero.mp4` en fond et
 * `public/media/hero.jpg` en affiche — pour que l'écran soit fini sans configuration. Les
 * variables `NEXT_PUBLIC_HERO_VIDEO` et `NEXT_PUBLIC_HERO_PHOTO` les REMPLACENT quand elles
 * sont posées (chemin local ou URL absolue) : c'est le point de passage pour mettre la vraie
 * vidéo du salon, sans toucher au code. La vidéo passe au-dessus de l'image, qui lui sert
 * d'affiche — et qui reste seule si la personne a demandé moins d'animation (`motion-reduce`).
 * Sans aucune des deux, le champ est dessiné. Dans tous les cas, un voile sombre monte du
 * bas : il ne filtre pas l'image, il garantit que le titre reste lisible dessus.
 *
 * Aucune animation au défilement, aucun carrousel : la première page doit être lisible
 * avant que React n'ait fini de s'hydrater.
 *
 * LE TITRE, revu sur trois points :
 *   - il porte la MÊME police que les grands titres de section — celle de
 *     `ServicesEditorial`, `PricingSection` et `Testimonials`, c'est-à-dire `font-display`.
 *     Le hero est la première marche de cette échelle : une seule famille pour tous les
 *     titres de la page, sinon on croit à deux maisons ;
 *   - plus d'italique du tout : c'est elle, et non la famille, qui faisait lire DEUX polices
 *     là où il n'y a qu'un titre ;
 *   - taille ramenée de `8.4vw / 8.2rem` à `4.4vw / 4.2rem` : à 130 px, le titre écrasait le
 *     reste de l'affiche au lieu de la signer.
 *
 * LE PASSAGE D'UNE PHRASE À L'AUTRE : trois réglages, chacun pour une cause précise.
 *
 *   1. PAS DE MASQUE. La cellule était dans un `overflow-hidden`, et la ligne sortante y
 *      glissait de 0,55 em : ses lettres se faisaient TRANCHER net par le bord du masque
 *      en pleine course. C'est ce qui se lisait comme un à-coup, et aucune courbe ne le
 *      rattrape. Le déplacement est donc réduit à 0,28 em et la découpe disparaît.
 *   2. PLUS LENT, ET DÉCALÉ. Sortie en 760 ms, entrée en 900 ms qui commence 160 ms après.
 *      Le chevauchement dure alors que les deux lignes sont presque effacées, donc on ne
 *      lit jamais deux phrases ensemble.
 *   3. COURBE MAISON, `cubic-bezier(0.22, 1, 0.36, 1)` : départ franc, arrivée qui se pose
 *      longuement. Le `ease-out` du navigateur s'arrête trop tôt et laisse une impression
 *      de coup de frein.
 *
 * Les autres lignes sont remises en place sans transition (invisibles, donc rien à voir) :
 * c'est ce qui évite qu'elles glissent quand leur tour passe.
 */
const PHOTO = process.env.NEXT_PUBLIC_HERO_PHOTO ?? "/media/hero.jpg";
const VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO ?? "/media/hero.mp4";

export default function HomeHero() {
  const { dict, locale } = useDictionary();
  const { hero, ui, site } = dict;

  /* La seconde ligne du titre CHANGE, comme une signature qui se cherche : « sans le
     chaos », « au bon rythme », « sous contrôle ». Trois phrases du dictionnaire, une
     toutes les 3,6 s, en fondu-glissé vertical — et rien du tout si la personne a demandé
     moins d'animation. Le premier rendu est toujours la première phrase : le serveur et le
     client peignent la même chose. */
  const lines = hero.leadRotating;
  const [activeLine, setActiveLine] = useState(0);
  /** La ligne qui vient de sortir : elle a besoin de son propre mouvement pour s'en aller. */
  const [leavingLine, setLeavingLine] = useState(-1);
  const shown = useRef(0);

  useEffect(() => {
    if (lines.length < 2 || prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      setActiveLine((current) => (current + 1) % lines.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [lines.length]);

  /* À chaque changement, la ligne qu'on quitte est retenue le temps de son départ. */
  useEffect(() => {
    if (shown.current === activeLine) return;
    setLeavingLine(shown.current);
    shown.current = activeLine;
  }, [activeLine]);
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;

  /* La vitrine de démonstration est celle du salon configuré : si la variable n'est pas
     posée, on renvoie vers la page fonctionnalités plutôt que vers une adresse qui
     n'existerait pas. */
  const demoSlug = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG;
  const demoHref = href(demoSlug ? `/s/${demoSlug}` : "/services");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ink text-paper"
    >
      {/* ——— Le champ : la photo si elle est fournie, sinon un ciel dessiné (ciel chaud,
              soleil haut à droite, grain). Dans les deux cas, le même voile par-dessus. */}
      <div aria-hidden className="absolute inset-0 -z-20">
        {PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo fournie par l'exploitant (chemin local ou URL), hors liste blanche de `next/image`
          <img
            src={PHOTO}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="h-full w-full bg-[linear-gradient(168deg,#e9d1ac_0%,#d9b283_26%,#b9865a_56%,#6b4a31_82%,#33251b_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(62%_48%_at_74%_8%,rgba(255,243,218,0.95),rgba(255,236,200,0.35)_38%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_96%,rgba(29,20,14,0.65),transparent_58%)]" />
          </>
        )}

        {/* La vidéo, au-dessus de l'image qui lui sert d'affiche : muette, en boucle,
            sans commandes (elle est décorative), retirée si l'on a demandé moins
            d'animation, et arrêtée dès qu'on a dépassé le premier écran — voir
            `AmbientVideo` : c'est ce qui rend le reste du défilement plus léger. */}
        {VIDEO && (
          <AmbientVideo
            src={VIDEO}
            poster={PHOTO}
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          />
        )}

        {/* Le voile : bas sombre pour le titre, haut à peine touché pour l'en-tête. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(21,17,14,0.94)_0%,rgba(21,17,14,0.55)_34%,rgba(21,17,14,0.12)_62%,rgba(21,17,14,0.18)_100%)]" />
        {/* Le grain vit dans son propre cadre : `grain` pose `position: relative`, ce qui
            écraserait l'`absolute` du calque. */}
        <div className="absolute inset-0">
          <div className="grain h-full w-full" />
        </div>
      </div>

      <div className="container-x relative flex min-h-svh flex-col pb-7 pt-28 sm:pb-9 lg:pb-11 lg:pt-32">
        {/* ——— L'action, à droite : une phrase, un bouton, une sortie discrète vers la
                démonstration. C'est le seul endroit du premier écran qui demande un geste. */}
        {/* SUR TÉLÉPHONE, l'affiche se réduit à trois éléments posés en bas : les trois
            lignes de petites capitales, le titre, et l'unique bouton. Le paragraphe d'à-côté,
            le lien vers la démonstration et la signature du bas sont retirés : sur 390 px de
            large, ils repoussaient le titre hors de l'écran et faisaient un hero bavard. Le
            bouton prend la place du bloc de droite et descend avec le texte — même
            composition que le hero de Contact sur mobile. */}
        <div className="ml-auto w-full max-w-[21rem] max-lg:order-3 max-lg:mt-8 max-lg:ml-0 max-lg:max-w-none lg:absolute lg:right-0 lg:top-[22%] lg:mt-0">
          <p className="hidden text-[0.95rem] leading-[1.6] text-paper/85 lg:block">{hero.aside}</p>

          <Link
            href={href("/register")}
            className="mt-6 inline-flex items-center gap-2 bg-paper px-6 py-3.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brand hover:text-paper"
          >
            {ui.freeQuote}
          </Link>

          <Link
            href={demoHref}
            className="mt-5 hidden w-fit text-[0.62rem] uppercase tracking-[0.16em] text-paper/55 underline decoration-paper/25 underline-offset-[6px] transition-colors hover:text-paper hover:decoration-paper/60 lg:block"
          >
            {hero.demo}
          </Link>
        </div>

        {/* ——— Trois lignes de petites capitales : la définition, pas le slogan. */}
        <p className="mt-auto max-lg:order-1 text-[0.6rem] uppercase leading-[2.1] tracking-[0.26em] text-paper/65 lg:pb-12">
          {hero.manifesto.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        {/* ——— Le titre. Il est déjà la phrase entière pour les lecteurs d'écran : les deux
                lignes ne sont qu'un découpage typographique. */}
        <h1
          id="hero-title"
          aria-label={hero.lead}
          className="mt-7 max-w-[16ch] max-lg:order-2 font-display text-[clamp(1.9rem,4.4vw,4.2rem)] leading-[1.02] tracking-[-0.02em] text-paper"
        >
          <span aria-hidden>{hero.leadStatic}</span>

          {/* La ligne qui tourne : toutes les phrases occupent la même cellule de grille,
              donc la hauteur du titre ne bouge pas quand l'une s'efface. Aucun masque
              au-dessus : une ligne qui se fait couper en plein mouvement, ça se voit. */}
          <span aria-hidden className="mt-1 block">
            <span className="grid">
              {lines.map((line, index) => {
                const state =
                  index === activeLine
                    ? "translate-y-0 opacity-100 duration-[900ms] delay-[160ms]"
                    : index === leavingLine
                      ? "-translate-y-[0.28em] opacity-0 duration-[760ms] delay-0"
                      : "translate-y-[0.28em] opacity-0 duration-0 delay-0";

                return (
                  <span
                    key={line}
                    className={`col-start-1 row-start-1 block transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${state}`}
                  >
                    {line}
                  </span>
                );
              })}
            </span>
          </span>
        </h1>

        {/* ——— La signature : le vocabulaire du produit d'un côté, la maison de l'autre. */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-paper/20 pt-4 text-[0.56rem] uppercase tracking-[0.2em] text-paper/50 sm:mt-11 max-lg:hidden">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {hero.ticker.map((item, index) => (
              <span key={item} className="flex items-center gap-3">
                {index > 0 && <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-paper/30" />}
                {item}
              </span>
            ))}
          </span>

          <span className="text-paper/40">
            © 2026 {site.name}
          </span>
        </div>
      </div>
    </section>
  );
}
