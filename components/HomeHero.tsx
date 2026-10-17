"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
 * LE MÉDIA N'EST PAS DANS LE CODE : `NEXT_PUBLIC_HERO_VIDEO` reçoit l'adresse de la vidéo
 * de fond (`/hero.mp4` déposée dans `public`, ou une URL absolue), et
 * `NEXT_PUBLIC_HERO_PHOTO` celle d'une image fixe. La vidéo passe au-dessus de l'image, qui
 * lui sert d'affiche — et qui reste seule si la personne a demandé moins d'animation
 * (`motion-reduce`). Sans aucune des deux, le champ est dessiné — ciel chaud, soleil haut à
 * droite, grain — pour que l'écran soit fini sans dépendre d'un asset. Dans tous les cas,
 * un voile sombre monte du bas : il ne filtre pas l'image, il garantit que le titre reste
 * lisible dessus.
 *
 * Aucune animation au défilement, aucun carrousel : la première page doit être lisible
 * avant que React n'ait fini de s'hydrater.
 *
 * LE TITRE, revu sur trois points, tous mesurés à l'œil sur la page :
 *   - il est écrit dans la police du SITE (`font-sans`, Sora chargée par `next/font`), plus
 *     dans la pile sérif de `--font-display`. Deux raisons : la sérif n'est pas téléchargée
 *     mais empruntée au système, donc elle change de dessin d'une machine à l'autre
 *     (Iowan sur macOS, Georgia sur Windows) ; et son italique, utilisée sur la ligne qui
 *     tourne, faisait lire DEUX polices là où il n'y a qu'un titre ;
 *   - plus d'italique du tout ;
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
const PHOTO = process.env.NEXT_PUBLIC_HERO_PHOTO;
const VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO;

/** Le type MIME suit l'extension : un `.webm` annoncé en `mp4` n'est pas lu par Safari. */
const VIDEO_TYPE = VIDEO?.endsWith(".webm")
  ? "video/webm"
  : VIDEO?.endsWith(".mov")
    ? "video/quicktime"
    : "video/mp4";

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
            sans commandes (elle est décorative), et retirée si l'on a demandé moins
            d'animation. */}
        {VIDEO && (
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={PHOTO}
            aria-hidden
            tabIndex={-1}
          >
            <source src={VIDEO} type={VIDEO_TYPE} />
          </video>
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
        <div className="ml-auto w-full max-w-[21rem] lg:absolute lg:right-0 lg:top-[22%] lg:mt-0">
          <p className="text-[0.95rem] leading-[1.6] text-paper/85">{hero.aside}</p>

          <Link
            href={href("/register")}
            className="mt-6 inline-flex items-center gap-2 bg-paper px-6 py-3.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brand hover:text-paper"
          >
            {ui.freeQuote}
          </Link>

          <Link
            href={demoHref}
            className="mt-5 block w-fit text-[0.62rem] uppercase tracking-[0.16em] text-paper/55 underline decoration-paper/25 underline-offset-[6px] transition-colors hover:text-paper hover:decoration-paper/60"
          >
            {ui.auth.panel.demo}
          </Link>
        </div>

        {/* ——— Trois lignes de petites capitales : la définition, pas le slogan. */}
        <p className="mt-16 text-[0.6rem] uppercase leading-[2.1] tracking-[0.26em] text-paper/65 sm:mt-20 lg:mt-auto lg:pb-12">
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
          className="mt-7 max-w-[16ch] font-sans text-[clamp(1.9rem,4.4vw,4.2rem)] font-normal leading-[1.02] tracking-[-0.02em] text-paper"
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
                    className={`col-start-1 row-start-1 block will-change-[opacity,transform] transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${state}`}
                  >
                    {line}
                  </span>
                );
              })}
            </span>
          </span>
        </h1>

        {/* ——— La signature : le vocabulaire du produit d'un côté, la maison de l'autre. */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-paper/20 pt-4 text-[0.56rem] uppercase tracking-[0.2em] text-paper/50 sm:mt-11">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {hero.ticker.map((item, index) => (
              <span key={item} className="flex items-center gap-3">
                {index > 0 && <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-paper/30" />}
                {item}
              </span>
            ))}
          </span>

          <span className="text-paper/40">
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>
      </div>
    </section>
  );
}
