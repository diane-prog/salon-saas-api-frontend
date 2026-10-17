"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail, Share, Spark } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { prefersReducedMotion } from "@/lib/motion";
import { socialIcon, socialLinks } from "@/components/SocialIcons";
import ContactSheet from "@/components/ContactSheet";
import DevisSheet from "@/components/DevisSheet";
import Chatbot from "@/components/Chatbot";

/**
 * Actions du site, posées en bas de l'écran, en TROIS TEMPS.
 *
 * 1. AU SCROLL : un seul bouton, avec une accroche qui TOURNE — cinq phrases de deux ou trois
 *    mots (« Un projet ? », « Un site web ? », « Une identité ? »…) qui se relaient en fondu.
 *    Un pavé de quatre boutons surgissant au premier coup de molette occupe l'écran sans avoir
 *    rien demandé, et une accroche figée se lit une fois puis disparaît : la séquence, elle,
 *    ouvre plusieurs portes et montre l'étendue de ce qu'il y a derrière. Elle ne s'affiche
 *    qu'une fois la page réellement parcourue (> 320 px), et se fige sous mouvement réduit.
 *
 * 2. AU CLIC : la BARRE horizontale se déploie en douceur — opacité, translation ET
 *    agrandissement — et remplace le bouton, qui s'efface au même endroit. Le rythme est celui
 *    demandé : la barre d'abord.
 *
 *    Attention aux propriétés animées : depuis Tailwind v4, `translate-y-*` et `scale-*`
 *    posent les propriétés `translate` et `scale`, PAS `transform`. Une transition qui liste
 *    `transform` ne les anime donc pas : la barre apparaissait d'un coup, en fondu — c'était
 *    le « brusque ». La liste de transition nomme ici les trois propriétés réellement posées.
 *
 * 3. PUIS, à 360 ms — quand la barre est posée — l'ÉVENTAIL des réseaux se déploie à son tour
 *    au-dessus d'elle, icône par icône. Pas en même temps : deux mouvements simultanés se
 *    brouillent, et on ne saurait plus ce qui vient d'où.
 *
 * Le dépliage inverse suit le même ordre à l'envers (éventail, puis barre, puis le bouton) :
 * les délais sont posés à l'aller comme au retour, dans le `style`, parce qu'ils dépendent du
 * sens du mouvement. `inert` sur ce qui est replié : un bouton invisible ne doit pas être
 * atteignable au clavier. Réduire l'animation ne change QUE les durées — la disposition, elle,
 * reste la même.
 *
 * LES QUATRE ACTIONS ont le même poids visuel dans la barre (une couleur, une hauteur, une
 * écriture) ; leur hiérarchie se joue dans les panneaux qu'elles ouvrent. Pas de bouton de
 * fermeture en plus : l'icône des réseaux fait TOGGLE (elle ouvre et referme l'éventail), et
 * la barre se replie au clic ailleurs ou à Échap — un cran de moins dans une rangée qui n'en
 * compte que quatre.
 *
 * L'ÉVENTAIL : six logos officiels, WhatsApp compris, en DEMI-CERCLE centré au-dessus de la
 * barre — de la gauche vers la droite en passant par le haut, jamais vers le bas. Il est centré
 * sur la BARRE (pas sur un bouton : centré sur le bouton, tout partait d'un côté et l'ensemble
 * filait à droite), et surélevé de 56 px pour que la barre reste entièrement EN DEHORS de
 * l'arc — sans cette garde, les extrémités retombaient au niveau de la barre et le bouton de
 * repli se retrouvait enfermé au milieu du demi-cercle.
 */

/**
 * Rayon de l'éventail (px) et garde au-dessus de la barre.
 *
 * `LIFT` vaut la MOITIÉ d'une icône (22 px) et pas plus : l'arc vient ainsi s'ASSEOIR sur la
 * barre, sans jour entre les deux. Surélevé davantage, il flottait détaché — et l'espace vide
 * se lisait comme un défaut d'alignement plutôt que comme un choix.
 */
const RADIUS = 120;
const LIFT = 22;
/** Attente de l'éventail : le temps que la barre se pose (ms). */
const FAN_DELAY = 360;

export default function ActionDock() {
  const { dict } = useDictionary();
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fan, setFan] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  /* La fenêtre de chat reste montée une fois ouverte : rouvrir reprend la conversation. */
  const [chatReady, setChatReady] = useState(false);
  /* Index de l'accroche affichée : les phrases sont toutes dans le DOM, seule l'active est
     visible — la relève est donc une transition CSS, sans état intermédiaire ni minuterie à
     faire courir dans le rendu. */
  const [phrase, setPhrase] = useState(0);
  const dockRef = useRef<HTMLDivElement>(null);

  const networks = socialLinks(dict.site);
  const phrases = dict.ui.dock.phrases;

  /* Relève des accroches : seulement quand le bouton est seul à l'écran (replié ET révélé par
     le scroll), et pas du tout sous mouvement réduit — une phrase qui change toute seule est
     exactement ce que demande d'éviter `prefers-reduced-motion`. */
  useEffect(() => {
    if (expanded || !shown || prefersReducedMotion()) return;
    const id = window.setInterval(() => setPhrase((current) => (current + 1) % phrases.length), 2600);
    return () => window.clearInterval(id);
  }, [expanded, shown, phrases.length]);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Clic ailleurs ou Échap : on replie tout (éventail ET barre). Un panneau qu'on ne peut pas
     refermer est un piège. */
  useEffect(() => {
    if (!expanded) return;
    const collapse = () => {
      setFan(false);
      setExpanded(false);
      /* L'accroche repart de sa première phrase : on ne rouvre pas sur le milieu d'une
         séquence. */
      setPhrase(0);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) collapse();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") collapse();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const contactLabels = {
    trigger: dict.ui.dock.contact,
    title: dict.contactPage.form.title,
    body: dict.contactPage.form.body,
    note: dict.contactPage.form.jsNote,
    submit: dict.contactPage.form.submit,
    successTitle: dict.contactPage.form.successTitle,
    successBody: dict.contactPage.form.successBody,
    fields: {
      firstName: dict.contactPage.form.firstName,
      lastName: dict.contactPage.form.lastName,
      email: dict.contactPage.form.email,
      subject: dict.contactPage.form.subject,
      message: dict.contactPage.form.message,
    },
  };

  /* UNE seule écriture pour tous les boutons de la barre. */
  const item =
    "flex h-11 items-center cursor-pointer gap-2 px-3.5 text-sm font-light text-paper/75 transition-colors duration-300 hover:text-turquoise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise";
  /* Le mot s'efface sous `sm` : sur téléphone, la barre reste une rangée compacte d'icônes
     (chaque bouton garde son intitulé en `aria-label`). */
  const word = "hidden sm:inline";

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-60 flex justify-center px-4 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
          shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* Le repère est le bord SUPÉRIEUR de la barre, EN SON MILIEU : l'éventail part de là,
            et le bouton d'accroche se pose au bas du même repère (donc à la place exacte de la
            barre, sans que rien ne bouge à l'écran au moment du remplacement). */}
        <div ref={dockRef} className="relative cursor-pointer pointer-events-auto">
          <div
            inert={!expanded}
            style={{ transitionDelay: expanded ? "0ms" : "150ms" }}
            /* `transition-[opacity,translate,scale]` : les trois propriétés que Tailwind pose
               réellement (`translate-*` et `scale-*` ne passent pas par `transform`). 650 ms
               et un agrandissement depuis 96 % : la barre naît du bouton au lieu de surgir. */
            className={`relative transition-[opacity,translate,scale] duration-[650ms] ease-out motion-reduce:transition-none ${
              expanded
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-3 scale-[0.96] opacity-0"
            }`}
          >
            {networks.map((network, i) => {
              const Icon = socialIcon(network.label);
              /* Demi-cercle : de π (gauche) à 2π (droite). En coordonnées d'écran, `sin` est
                 alors négatif — les icônes montent. */
              const angle = Math.PI + (Math.PI / (networks.length - 1)) * i;
              const x = Math.cos(angle) * RADIUS;
              const y = Math.sin(angle) * RADIUS - LIFT;
              return (
                <a
                  key={network.label}
                  href={network.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={network.label}
                  title={network.label}
                  /* Hors de l'éventail, le lien sort du parcours clavier ET des technologies
                     d'assistance : il est invisible, donc il doit l'être pour tout le monde. */
                  tabIndex={fan ? undefined : -1}
                  aria-hidden={!fan}
                  style={{
                    transform: fan
                      ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                      : "translate(-50%, calc(-50% + 12px))",
                    /* L'éventail attend que la barre soit posée (360 ms), puis se déploie
                       icône par icône. Au repli, aucun délai : il part le premier. */
                    transitionDelay: fan ? `${FAN_DELAY + i * 45}ms` : "0ms",
                  }}
                  className={`absolute left-1/2 top-0 grid h-11 w-11 place-items-center bg-ink/90 text-paper/75 ring-1 ring-paper/15 backdrop-blur-md transition-[transform,opacity] duration-500 ease-out hover:text-turquoise hover:ring-turquoise/40 motion-reduce:transition-none ${
                    fan ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {Icon ? <Icon className="h-[1.15rem] w-[1.15rem]" /> : network.label.slice(0, 2)}
                </a>
              );
            })}

            <div
              role="group"
              aria-label={dict.ui.dock.title}
              className="flex items-center cursor-pointer gap-1 bg-ink/85 p-1.5 text-paper ring-1 ring-paper/15 backdrop-blur-md shadow-lift"
            >
              <DevisSheet
                triggerClassName={item}
                triggerContent={
                  <>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                    <span className={word}>{dict.ui.dock.quote}</span>
                  </>
                }
              />

              <ContactSheet
                labels={contactLabels}
                triggerClassName={item}
                triggerContent={
                  <>
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className={word}>{dict.ui.dock.contact}</span>
                  </>
                }
              />

              <button
                type="button"
                onClick={() => {
                  setChatReady(true);
                  setChatOpen(true);
                  setFan(false);
                }}
                aria-expanded={chatOpen}
                aria-controls="belora-chat"
                aria-label={dict.ui.dock.chat}
                className={item}
              >
                <Spark className="h-4 w-4 shrink-0" />
                <span className={word}>{dict.ui.dock.chat}</span>
              </button>

              {/* L'icône des réseaux est un TOGGLE : elle ouvre l'éventail et le referme. Pas
                  de seconde croix pour ça — c'est le seul geste de repli interne, le reste
                  (clic ailleurs, Échap) replie toute la barre. */}
              <button
                type="button"
                onClick={() => setFan((open) => !open)}
                aria-expanded={fan}
                aria-label={fan ? dict.ui.dock.closeSocials : dict.ui.dock.openSocials}
                title={dict.ui.dock.socials}
                className={`grid h-11 cursor-pointer w-11 shrink-0 place-items-center transition-colors duration-300 hover:text-turquoise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise ${
                  fan ? "text-turquoise" : "text-paper/75"
                }`}
              >
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* L'accroche, seule visible au scroll. Elle se pose au bas du repère, à la place
              exacte de la barre, et s'efface dès que celle-ci se déploie. */}
          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              setFan(true);
            }}
            inert={expanded}
            aria-label={dict.ui.dock.openActions}
            /* Au repli, l'accroche revient en DERNIER : 150 ms d'attente + 420 ms de barre,
               donc après 570 ms. */
            style={{ transitionDelay: expanded ? "0ms" : "720ms" }}
            className={`absolute cursor-pointer bottom-0 left-1/2 flex h-11 -translate-x-1/2 items-center gap-2 bg-ink/85 px-4 text-sm font-light text-paper ring-1 ring-paper/15 backdrop-blur-md shadow-lift transition-[opacity,scale] duration-300 ease-out hover:text-turquoise motion-reduce:transition-none ${
              expanded ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            {/* AUCUNE icône : l'accroche qui tourne dit déjà ce que la barre ouvre, et une
                pastille de plus ne ferait que répéter. Le bouton reste un bouton — son
                `aria-label` le nomme pour l'assistance. */}
            {/* Les phrases sont TOUTES dans la même cellule de grille : le bouton prend la
                largeur de la plus longue, et la relève se fait par transition — inutile de
                mesurer, de deviner une largeur, ni de faire clignoter le bouton. Décoratif
                pour l'assistance (`aria-hidden`) : le sens est dans l'`aria-label` du bouton. */}
            <span aria-hidden className="grid overflow-hidden">
              {phrases.map((text, i) => (
                <span
                  key={text}
                  className={`col-start-1 row-start-1 whitespace-nowrap transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none ${
                    i === phrase ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  {text}
                </span>
              ))}
            </span>
          </button>
        </div>
      </div>

      {chatReady && <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />}
    </>
  );
}
