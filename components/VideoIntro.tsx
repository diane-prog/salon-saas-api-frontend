"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDictionary } from "@/components/DictionaryProvider";
import {
  INTRO_ATTR,
  INTRO_FADE_MS,
  INTRO_READY_MS,
  INTRO_SKIP_EVENT,
  INTRO_TAIL_MS,
  INTRO_VIDEO_SECONDS,
} from "@/lib/intro";
import { lockScroll } from "@/lib/scroll";

/**
 * Ouverture du site : la vidéo de logo (`public/img/leegie-global-loader.mp4`) couvre
 * l'écran à la PREMIÈRE arrivée de la session, puis s'efface en fondu sur la page.
 *
 * LE FICHIER EST FABRIQUÉ POUR CET USAGE, et ces réglages sont dans le média, pas ici :
 *   - il dure 5,4 s : la prise d'origine (8 s) est ACCÉLÉRÉE 1,5× ;
 *   - il est DÉZOOMÉ — rendu sur 2344 × 1318 alors que la prise d'origine fait 1280 × 720,
 *     réduite et centrée dedans. Le logo n'occupe plus que ~14 % de la largeur du cadre au
 *     lieu de 50 % (≈ 276 px sur une fenêtre de 1920, contre 818 px au départ) : il est posé
 *     au centre de beaucoup de vide, et tout ce vide est du fond uni ;
 *   - ce fond est exactement #070707, la couleur de l'écran qui le porte (globals.css) :
 *     la vidéo n'a donc ni bord ni bande, elle se confond avec la page ;
 *   - il commence par un fondu de 0,8 s depuis le noir : le logo apparaît au lieu de
 *     « démarrer », ce qui est exactement l'effet recherché — ça ne doit pas se lire comme
 *     une vidéo qu'on lance, mais comme la page qui se compose.
 *   - plus de piste audio : elle ne servait à rien (la vidéo est muette) et son absence
 *     écarte toute hésitation des navigateurs sur la lecture automatique.
 *
 * ELLE N'EST PAS MONTÉE APRÈS COUP : son balisage est dans le HTML servi, masqué par défaut —
 * c'est le script d'en-tête (`lib/intro.ts`) qui le découvre, avant la première peinture. Le
 * composant ne fait donc que la JOUER (l'effet ci-dessous ne fait rien tant que `data-intro`
 * n'est pas posé), puis la retirer.
 *
 * CE QUI DÉMARRE LA VIDÉO : rien d'autre que `<html data-intro>`. La session est marquée au
 * même moment, dans le script : quelqu'un qui recharge la page pendant l'animation ne la
 * revoit pas, et une visite plus tard dans la même session non plus.
 *
 * SORTIES, toutes égales (la première gagne) : la fin de la vidéo, une erreur de lecture, un
 * clic n'importe où, la touche Échap — et deux chiens de garde :
 *   - si la vidéo n'a pas commencé dans `INTRO_READY_MS` (réseau lent, autoplay refusé), on
 *     n'impose pas d'écran noir : on découvre ;
 *   - si elle joue mais ne se termine jamais, `INTRO_TAIL_MS` après sa durée on découvre.
 * Aucune de ces sorties n'est obligatoire non plus : le script d'en-tête a son propre minuteur,
 * qui joue même si React ne se monte jamais. L'écran ne peut donc PAS rester bloqué.
 *
 * MOUVEMENT RÉDUIT : le script n'ouvre rien du tout. Le fondu de sortie, lui, est du CSS pur.
 */
export default function VideoIntro() {
  const { dict } = useDictionary();
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Une fois la sortie engagée : fondu en cours, puis retrait du balisage. */
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  /** Garde-fou : la première sortie gagne, les suivantes ne font rien. */
  const finished = useRef(false);
  /** Minuteur « la vidéo n'a pas démarré » — levé dès la première image jouée. */
  const readyTimer = useRef(0);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    /* Le défilement est rendu AVANT le fondu : on peut faire défiler la page qu'on découvre,
       au lieu d'attendre la fin de l'animation. */
    lockScroll(false);
    setLeaving(true);
    window.setTimeout(() => {
      document.documentElement.removeAttribute(INTRO_ATTR);
      setDone(true);
    }, INTRO_FADE_MS);
  }, []);

  useEffect(() => {
    if (done) return;
    /* Rien à jouer si l'ouverture n'a pas été ouverte (déjà vue, mouvement réduit, ou
       JavaScript : le script d'en-tête est le seul à poser l'attribut). */
    if (document.documentElement.getAttribute(INTRO_ATTR) === null) return;

    const video = videoRef.current;
    if (!video) return;

    /* La page ne défile pas derrière un écran opaque — et comme l'ouverture couvre aussi les
       liens du site, rien ne peut se déclencher dessous. */
    lockScroll(true);
    /* La propriété prime sur l'attribut pour l'autoplay (certains navigateurs ne reprennent pas
       l'attribut `muted` sur un élément déjà présent dans le HTML). */
    video.muted = true;

    /* LA VIDÉO DÉMARRE TOUTE SEULE (`autoPlay` dans le balisage) : elle n'attend pas
       l'hydratation, qui peut arriver plusieurs secondes après la peinture — c'est mesuré en
       développement, et c'est ce qui faisait qu'un visiteur cliquait dans le vide pendant que
       l'écran couvrait. On ne fait donc ici que CONSTATER :
         - déjà finie (l'animation a joué pendant que React se montait) : on découvre ;
         - déjà en cours : on ne relance rien, et le minuteur « ça ne démarre pas » n'a plus
           d'objet — l'événement `playing` est déjà passé ;
         - en attente : on demande la lecture, et LÀ on surveille le démarrage. */
    if (video.ended) {
      finish();
      return;
    }

    if (video.paused) {
      video.play().catch(finish);
      readyTimer.current = window.setTimeout(finish, INTRO_READY_MS);
    }

    /* Le chien de garde de fin part de la somme : même si la vidéo a mis trois secondes à
       démarrer, on lui laisse sa durée entière après la première image. */
    const watchdog = window.setTimeout(
      finish,
      INTRO_READY_MS + (video.duration || INTRO_VIDEO_SECONDS) * 1000 + INTRO_TAIL_MS,
    );

    return () => {
      window.clearTimeout(readyTimer.current);
      window.clearTimeout(watchdog);
    };
  }, [done, finish]);

  /* Échap découvre l'écran, comme partout ailleurs dans le site. */
  useEffect(() => {
    if (done) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [done, finish]);

  /* Le script d'en-tête peut découvrir l'écran tout seul, au PREMIER geste — c'est ce qui rend
     l'ouverture échappable avant l'hydratation. Il ne peut pas, lui, relâcher le verrou de
     défilement (il ne l'a pas posé). Ici on range donc derrière lui : sans fondu, puisque
     l'écran est déjà masqué par le retrait de l'attribut. */
  useEffect(() => {
    if (done) return;
    const onSkip = () => {
      if (finished.current) return;
      finished.current = true;
      lockScroll(false);
      setDone(true);
    };
    window.addEventListener(INTRO_SKIP_EVENT, onSkip);
    return () => window.removeEventListener(INTRO_SKIP_EVENT, onSkip);
  }, [done]);

  /* Le verrou de défilement suit le composant : s'il disparaît sans passer par `finish`
     (changement de langue pendant l'ouverture, par exemple), la page reste utilisable. */
  useEffect(() => () => lockScroll(false), []);

  if (done) return null;

  return (
    <div
      role="region"
      aria-label={dict.ui.intro.label}
      /* Un clic n'importe où découvre l'écran : c'est LA sortie de l'ouverture. */
      onClick={finish}
      className={`intro-video w-screen h-screen fixed inset-0 z-100 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      {/* Pas d'image d'attente, et ce n'est pas un oubli : la vidéo s'ouvre sur son propre
          fond (#070707) puis le laisse monter en fondu — exactement la couleur de l'écran qui
          la porte. Le temps de chargement se confond donc avec le début de l'animation, sans
          affiche ni raccord. */}
      <video
        ref={videoRef}
        src="/img/leegie-global-loader.mp4"
        /* `autoPlay` : l'animation part dès que le HTML est analysé, SANS attendre React —
           c'est le point corrigé ci-dessus. Muette et `playsInline` : le navigateur l'autorise
           donc même sans geste du visiteur. */
        autoPlay
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        onPlaying={() => window.clearTimeout(readyTimer.current)}
        onEnded={finish}
        onError={finish}
        aria-hidden
        tabIndex={-1}
        /* `object-contain` : la vidéo n'est jamais rognée. Sur un écran large, la règle CSS
           la passe en `cover` pour qu'elle remplisse la fenêtre (le logo est centré et
           étroit, le recadrage ne tombe que dans le fond) ; sur un écran plus haut que large,
           `cover` rognerait le logo, donc on garde `contain` — et c'est sans conséquence,
           le fond de la vidéo et celui de l'écran étant la même couleur. */
        className="h-full w-full object-contain"
      />
      {/* Aucun bouton « passer » : la séquence est courte, et l'écran s'en va au premier
          geste — clic n'importe où (ci-dessus), touche Échap, ou tout premier contact
          entendu par le script d'en-tête, y compris avant l'hydratation. Un bouton visible
          aurait, lui, rendu l'ouverture « interactive », alors qu'elle doit se lire comme
          une page qui se compose. */}
    </div>
  );
}
