/**
 * Ouverture du site : la vidéo de logo (`public/img/leegie-global-loader.mp4`, 5,4 s), jouée
 * UNE FOIS PAR SESSION à la première arrivée — voir `components/VideoIntro.tsx`.
 *
 * POURQUOI CE FICHIER EXISTE À PART : la décision « faut-il couvrir l'écran ? » doit être
 * prise AVANT la première peinture, sinon la page d'accueil apparaît une à deux frames, puis
 * disparaît sous la vidéo — un clignotement. Elle est donc prise par un SCRIPT EN LIGNE dans
 * `<head>` (comme le `data-js` que le site pose déjà), et ce script a besoin des mêmes clés et
 * de la même durée que le composant : elles vivent ici, une seule fois.
 *
 * CE QUE LE SCRIPT FAIT, dans cet ordre : il ne touche à rien si l'ouverture a déjà été jouée
 * dans la session, ni si la personne demande moins d'animations ; sinon il marque la session
 * comme jouée et pose `data-intro` sur `<html>`, ce qui découvre l'écran (règle CSS dans
 * `globals.css`).
 *
 * LE DERNIER MINUTEUR EST UN FILET DE SÉCURITÉ, pas la sortie normale : sans React pour
 * retirer le panneau (hydratation en échec, JavaScript cassé), il garantit que l'ouverture ne
 * peut PAS enfermer le visiteur devant un écran opaque. La sortie normale, elle, est la fin de
 * la vidéo — ou le bouton « Passer », ou Échap, ou un clic n'importe où.
 */

/** Clé de session : présente dès que l'ouverture a été jouée une fois. */
export const INTRO_STORAGE_KEY = "leegi-intro";

/** Attribut posé sur `<html>` : c'est lui qui rend l'ouverture visible (CSS). */
export const INTRO_ATTR = "data-intro";

/**
 * Durée du fondu de sortie, en ms — DOIT valoir la valeur écrite dans `globals.css`
 * (`.intro-video`, propriété `transition`). Le CSS ne peut pas lire une constante TS.
 */
export const INTRO_FADE_MS = 620;

/**
 * Si la vidéo n'a pas COMMENCÉ à jouer dans ce délai (1 Mo à télécharger), on n'insiste pas :
 * l'ouverture se retire et le visiteur voit le site. Un écran noir qui dure parce que le
 * réseau est lent est pire que pas d'animation du tout.
 */
export const INTRO_READY_MS = 4000;

/** Marge ajoutée à la durée de la vidéo pour le chien de garde, quand la lecture a démarré. */
export const INTRO_TAIL_MS = 2500;

/**
 * Durée de repli si les métadonnées de la vidéo ne sont pas encore connues. Elle dure 5,4 s
 * (prise de 8 s accélérée 1,5×) : on arrondit au-dessus, pour que le chien de garde laisse
 * toujours plus de temps que nécessaire plutôt que de couper l'animation. */
export const INTRO_VIDEO_SECONDS = 6;

/**
 * Filet de sécurité du script d'en-tête : au pire, l'écran est découvert au bout de ce délai.
 * Il doit rester AU-DESSUS de la séquence réelle, sinon il la couperait : `INTRO_VIDEO_START_MS`
 * (le mot de bienvenue), plus 5,4 s de vidéo, plus le fondu de sortie (`INTRO_FADE_MS`), plus
 * une marge. 11 s laisse plus de 4 s de rab. */
export const INTRO_SCRIPT_MAX_MS = 11000;

/**
 * Événement émis par le script d'en-tête quand quelqu'un touche à l'écran. Il existe pour un
 * cas mesuré : AVANT L'HYDRATATION, le composant n'écoute encore rien — l'écran couvrait donc
 * sans qu'aucun geste ne puisse le retirer (en développement, l'hydratation arrive plusieurs
 * secondes après la peinture). Le script retire l'attribut lui-même, puis prévient le
 * composant : si React est monté il range derrière lui (verrou de défilement, fondu), sinon
 * il n'y a rien à ranger, puisque c'est React qui avait posé le verrou.
 */
export const INTRO_SKIP_EVENT = "leegi-intro-skip";

/**
 * Instant où la VIDÉO démarre, en ms depuis le début du document.
 *
 * Elle ne démarre pas toute seule : elle attend la fin du mot de bienvenue (`globals.css`,
 * `.intro-welcome` — 2 s d'apparition, tenue et fondu). 1700 ms tombe PENDANT ce fondu de
 * sortie, pour que le mot se dissolve dans l'apparition du logo au lieu de laisser un temps
 * mort sur un écran noir. Si l'une des deux durées change, faire bouger l'autre : elles se
 * répondent, et rien ne les relie automatiquement.
 */
export const INTRO_VIDEO_START_MS = 1700;

/**
 * Le script d'en-tête, en ligne. Écrit en une seule expression, sans dépendance ni attente :
 * il s'exécute pendant l'analyse du `<head>`, donc avant que quoi que ce soit de la page ne
 * soit peint. Tout est enveloppé dans un `try` : en navigation privée, `sessionStorage` peut
 * lever, et dans ce cas on préfère ne pas d'ouverture du tout plutôt qu'une page cassée.
 *
 * Il fait TROIS choses de plus que d'ouvrir l'écran :
 *   - `warm` : dès le DOM construit et seulement si l'ouverture a lieu, il précharge la vidéo
 *     (`load()`), pour qu'elle soit prête quand le mot de bienvenue se termine — 92 Ko, mais
 *     personne n'a à les attendre après coup. Elle n'est jamais préchargée sur les visites
 *     où l'ouverture n'a pas lieu : le balisage reste en `preload="none"`.
 *   - `boot` : à `INTRO_VIDEO_START_MS`, il démarre la lecture. C'est LA raison d'être de ce
 *     script pour la vidéo : avant l'hydratation, React n'existe pas encore, et le mot de
 *     bienvenue serait suivi d'un écran noir en développement (l'hydratation y arrive
 *     plusieurs secondes après la peinture).
 *   - les deux patientent si la vidéo n'est pas encore dans le DOM (60 essais, 80 ms).
 *     Le minuteur de fermeture ci-dessous reste le filet : quoi qu'il arrive, l'écran ne peut
 *     pas rester couvert.
 */
export const INTRO_SCRIPT = `(function(){try{
if(sessionStorage.getItem("${INTRO_STORAGE_KEY}"))return;
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
sessionStorage.setItem("${INTRO_STORAGE_KEY}","1");
var root=document.documentElement;
root.setAttribute("${INTRO_ATTR}","on");
function close(){if(root.getAttribute("${INTRO_ATTR}")!=="on")return;root.removeAttribute("${INTRO_ATTR}");try{window.dispatchEvent(new Event("${INTRO_SKIP_EVENT}"))}catch(e){}}
document.addEventListener("pointerdown",close,{once:true,capture:true});
document.addEventListener("keydown",close,{once:true,capture:true});
window.setTimeout(close,${INTRO_SCRIPT_MAX_MS});
var tries=0;
function vid(){return document.querySelector(".intro-video video")}
function wait(fn){var v=vid();if(v){fn(v);return}if(++tries<60)window.setTimeout(function(){wait(fn)},80)}
function warm(v){v.muted=true;try{v.load()}catch(e){}}
function boot(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
document.addEventListener("DOMContentLoaded",function(){tries=0;wait(warm)});
window.setTimeout(function(){tries=0;wait(boot)},${INTRO_VIDEO_START_MS});
}catch(e){}})();`;
