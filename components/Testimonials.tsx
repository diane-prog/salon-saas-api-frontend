"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL } from "@/lib/editorial";

/**
 * Section « Témoignages » de l'accueil — les mots des clientes, sur un fond plein cadre.
 *
 * CE QU'ELLE PARLE : de Belora. Les citations sont celles que l'exploitant autorise, dans
 * `dictionary.testimonials` (nom, rôle, citation, image). Elle ne lit PAS les avis publiés
 * sur la vitrine d'un salon : ce que dit une cliente d'un salon de démonstration est un avis
 * sur ce salon-là, pas sur le logiciel.
 *
 * LA COMPOSITION : bandeau plein cadre, rail qui traverse toute la largeur de la fenêtre
 * (seuls le sur-titre et le titre restent sur `container-x`), et le fond de la section EST
 * l'image de la case active — floutée, assombrie, croisée en fondu.
 *
 * LE MOUVEMENT, réglé ici et pas laissé au navigateur. Trois choses le rendaient saccadé :
 *   1. `scrollTo({ behavior: "smooth" })` : la durée est choisie par le navigateur et
 *      change d'une machine à l'autre, sans courbe maîtrisée ;
 *   2. `snap-mandatory` reprenait la main PENDANT le trajet et recollait la case au point
 *      d'arrêt le plus proche — d'où l'à-coup en fin de course ;
 *   3. le saut de la dernière case à la première parcourait tout le rail en un temps
 *      constant, donc à une vitesse démesurée.
 * D'où `glideTo` : une interpolation image par image, courbe `easeInOutCubic`, durée
 * proportionnelle à la distance (≈ 0,9 s pour une case, ≈ 1,8 s pour un retour au début),
 * et le snap SUSPENDU le temps du trajet puis rendu intact. L'index actif bascule à
 * l'arrivée, pas au départ : le fond se fond dans l'image quand la case est en place.
 *
 * Le rail défile seul toutes les six secondes, et boucle. Il s'arrête au survol, au focus
 * clavier et quand l'onglet passe en arrière-plan ; il ne démarre pas du tout sous
 * `prefers-reduced-motion` — un défilement qu'on n'a pas demandé est exactement ce que ce
 * réglage refuse. Le doigt, la molette et les flèches restent maîtres et interrompent le
 * mouvement en cours.
 */

/** Écart entre deux cases (`gap-3`), nécessaire pour calculer une avance exacte. */
const GAP = 12;

/** Cadence du défilement automatique, en millisecondes. */
const AUTOPLAY_MS = 6000;

/** Durée d'un déplacement : une base, puis une part proportionnelle à la distance. */
const GLIDE_BASE_MS = 620;
const GLIDE_PER_PX = 0.28;
const GLIDE_MAX_MS = 1800;

/** `easeInOutCubic` : démarre doucement, accélère au milieu, se pose sans à-coup. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Testimonials() {
  const { dict } = useDictionary();
  const t = dict.ui.testimonials;
  const quotes = dict.testimonials;
  const count = quotes.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  /** Animation en cours (annulable) et verrou : pendant un trajet, le scroll ne fait pas foi. */
  const glide = useRef(0);
  const moving = useRef(false);
  /** L'index courant, en ref : le minuteur doit lire la valeur du moment, pas celle du rendu. */
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Une case + son écart. Mesuré sur la première case : elles ont toutes la même largeur. */
  const step = useCallback(() => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    return (card?.offsetWidth ?? track?.clientWidth ?? 1) + GAP;
  }, []);

  /** Rend le snap et l'écoute du défilement au navigateur. */
  const release = useCallback(() => {
    const track = trackRef.current;
    if (track) track.style.scrollSnapType = "";
    moving.current = false;
  }, []);

  const glideTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      const target = Math.max(0, Math.min(count - 1, index));

      /* Sous `prefers-reduced-motion`, on ne fait pas glisser : on change de case. Le
         réglage demande moins de mouvement, pas un mouvement plus court. */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        track.scrollLeft = target * step();
        activeRef.current = target;
        setActive(target);
        return;
      }

      const distance = target * step();
      const from = track.scrollLeft;
      const delta = distance - from;

      if (Math.abs(delta) < 1) {
        activeRef.current = target;
        setActive(target);
        return;
      }

      if (glide.current) cancelAnimationFrame(glide.current);
      moving.current = true;
      /* Le snap recollerait la case à chaque image : on le retire le temps du trajet. */
      track.style.scrollSnapType = "none";

      const duration = Math.min(
        GLIDE_MAX_MS,
        GLIDE_BASE_MS + Math.abs(delta) * GLIDE_PER_PX,
      );
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        track.scrollLeft = from + delta * ease(progress);

        if (progress < 1) {
          glide.current = requestAnimationFrame(tick);
          return;
        }

        glide.current = 0;
        /* La case est en place : le fond peut la rejoindre. */
        activeRef.current = target;
        setActive(target);
        release();
      };

      glide.current = requestAnimationFrame(tick);
    },
    [count, release, step],
  );

  /** Geste de l'utilisateur : il reprend la main immédiatement, sans finir le trajet. */
  const interrupt = () => {
    if (glide.current) cancelAnimationFrame(glide.current);
    glide.current = 0;
    release();
  };

  /* Le minuteur lit `activeRef` et la géométrie à l'instant du tir : rien à recalculer
     quand la fenêtre est redimensionnée, et pas de dépendance sur `active` qui relancerait
     l'intervalle à chaque case. */
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (document.hidden || moving.current) return;
      glideTo(activeRef.current + 1 >= count ? 0 : activeRef.current + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [count, paused, glideTo]);

  /* Le doigt, la molette et les flèches déplacent le rail : c'est LUI qui fait foi. On
     relit la position à chaque image pour que le fond suive, y compris après un geste.
     Pendant un trajet animé, l'index est posé par `glideTo` — sans ce verrou, un retour
     au début ferait défiler les six images dans le fond en trois dixièmes de seconde. */
  const handleScroll = () => {
    if (moving.current || frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const index = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / step())));
      activeRef.current = index;
      setActive((current) => (current === index ? current : index));
    });
  };

  if (count === 0) return null;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink text-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {/* ——— Le fond : l'image de la case active, floutée. Toutes les couches restent
              montées et se croisent en opacité — changer d'image ne recharge rien. */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(45% 55% at 22% 30%, #cfa27188, transparent 70%), radial-gradient(40% 50% at 78% 18%, #96693e77, transparent 72%), radial-gradient(50% 60% at 65% 95%, #5d422b99, transparent 75%)",
          }}
        />

        {quotes.map((item, index) =>
          item.image ? (
            <div
              key={`${item.name}-bg`}
              className="absolute inset-0 scale-110 transform-gpu bg-cover bg-center blur-xl transition-opacity duration-[1100ms] ease-in-out motion-reduce:transition-none"
              style={{
                backgroundImage: `url(${item.image})`,
                opacity: index === active ? 1 : 0,
              }}
            />
          ) : null,
        )}

        {/* L'assombrissement : sans lui, le titre et les flèches tombent sur du clair. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#15110ee6_0%,#15110e99_42%,#15110ef2_100%)]" />

        <div className="grain absolute inset-0" />
      </div>

      <div className="relative py-20 sm:py-24 lg:py-28">
        {/* ——— Sur-titre, titre, flèches : alignés sur la grille du site. */}
        <div className="container-x flex flex-wrap items-start justify-between gap-x-12 gap-y-6">
          <div>
            <span className={`${LABEL} text-paper/45`}>[ {t.eyebrow} ]</span>

            <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(2rem,4.4vw,3.6rem)] font-light leading-[1.03] tracking-[-0.025em] text-paper">
              {t.title}
            </h2>
          </div>

          {count > 1 && (
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => glideTo(active - 1)}
                aria-label={t.previous}
                className="grid h-10 w-10 place-items-center border border-paper/25 text-paper/70 transition-colors hover:border-paper hover:text-paper"
              >
                <span aria-hidden>‹</span>
              </button>
              <button
                type="button"
                onClick={() => glideTo(active + 1)}
                aria-label={t.next}
                className="grid h-10 w-10 place-items-center border border-paper/25 text-paper/70 transition-colors hover:border-paper hover:text-paper"
              >
                <span aria-hidden>›</span>
              </button>
            </div>
          )}
        </div>

        {/* ——— Le rail : PLEINE LARGEUR de la fenêtre. Ses marges intérieures reprennent
                exactement celles de `container-x` — y compris quand la page est centrée
                au-delà de 80rem — pour que la première case tombe sous le titre.

                `scroll-px-*` doit doubler `px-*` : sans lui, l'alignement magnétique
                amène la première case jusqu'au bord de l'écran et la marge disparaît
                (mesuré : `scrollLeft` valait 120 au repos). Avec, la position d'arrêt de
                la case n est exactement `n × (largeur + écart)`, ce que lit `glideTo`. */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={interrupt}
          onWheel={interrupt}
          onTouchStart={interrupt}
          aria-live="off"
          className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] scroll-px-5 sm:px-8 sm:scroll-px-8 lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:scroll-px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] [&::-webkit-scrollbar]:hidden"
        >
          {quotes.map((item, index) => (
            <article
              key={`${item.name}-${item.quote.slice(0, 16)}`}
              aria-current={index === active ? "true" : undefined}
              className={`grid w-[calc(100vw-2.5rem)] max-w-[68rem] shrink-0 snap-start grid-cols-1 gap-0 bg-paper text-ink transition-opacity duration-700 ease-out sm:w-[min(86vw,58rem)] sm:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] ${
                index === active ? "opacity-100" : "opacity-55"
              }`}
            >
              {/* Le portrait : la photo fournie, sinon un aplat chaud. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.08] sm:aspect-auto sm:min-h-[24rem] lg:min-h-[28rem]">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- photo fournie par l'exploitant (chemin local ou URL), hors liste blanche de `next/image`
                  <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="grain absolute inset-0 block bg-[linear-gradient(150deg,#e8cda4_0%,#cfa271_42%,#96693e_78%,#5d422b_100%)]" />
                )}
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
                <span className="text-[0.82rem] text-ink/45">
                  {item.name.split(" ")[0]} {t.says}
                </span>

                <blockquote className="mt-6 max-w-[34ch] font-display text-[clamp(1.25rem,2.5vw,1.95rem)] font-light leading-[1.3] tracking-[-0.015em] text-ink">
                  {item.quote}
                </blockquote>

                <div className="mt-auto pt-12">
                  <p className="text-[0.9rem] font-medium text-ink">{item.name}</p>
                  {(item.role || item.company) && (
                    <p className="mt-1 text-[0.78rem] text-ink/45">
                      {[item.role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
