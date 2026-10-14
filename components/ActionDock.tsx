"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Close, Mail, Share, Spark } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { socialIcon, socialLinks } from "@/components/SocialIcons";
import ContactSheet from "@/components/ContactSheet";
import DevisSheet from "@/components/DevisSheet";
import Chatbot from "@/components/Chatbot";

/**
 * Barre d'actions flottante, en bas de l'écran, révélée par le SCROLL.
 *
 * Pourquoi au scroll et pas d'emblée : en haut de page, le visiteur lit ; un pavé de boutons
 * posé sur le hero ne fait que masquer la photo. Dès qu'il descend — donc dès qu'il cherche
 * quelque chose — les issues du site se mettent à portée. Elle repart au retour en haut, par
 * la même transition.
 *
 * QUATRE actions de MÊME POIDS visuel : une seule couleur, une seule hauteur, une seule
 * écriture — le métier de chacune est dit par son icône et son mot, pas par un dégradé. La
 * hiérarchie se fait à l'intérieur des panneaux (le devis a l'action pleine, le contact la
 * page), pas dans la barre.
 *
 * - `devis` ouvre le formulaire de devis (`DevisSheet`) ;
 * - `contacter` ouvre celui du contact (`ContactSheet`) ;
 * - `assistant` ouvre la fenêtre de chat (`Chatbot`) ;
 * - `réseaux` déploie l'éventail.
 *
 * L'ÉVENTAIL : six logos officiels, WhatsApp compris, en DEMI-CERCLE centré au-dessus de la
 * barre — de la gauche vers la droite en passant par le haut, jamais vers le bas.
 *
 * Deux réglages comptent plus que le reste :
 *
 * 1. l'arc est centré sur la BARRE, pas sur le bouton. Un éventail centré sur le bouton
 *    envoyait toutes les icônes d'un seul côté et l'ensemble partait sur la droite ; centré
 *    sur la barre, il est symétrique et tient dans l'écran dès 320 px de large
 *    (2 × (120 + 22) = 284 px) ;
 * 2. l'arc est surélevé de 56 px (`LIFT`). Sans cette garde, ses deux extrémités retombaient
 *    au niveau de la barre, et le bouton — devenu une croix à l'ouverture — se retrouvait
 *    enfermé AU MILIEU de l'arc. Surélevé, l'arc flotte nettement au-dessus : la barre est
 *    entièrement dehors, et la croix reste un bouton de la barre, sous l'extrémité droite de
 *    l'arc.
 *
 * Rayon de 120 px : 2 × 120 × sin(18°) = 74 px entre deux icônes de 44 px — largement de
 * quoi respirer.
 */

/** Rayon de l'éventail (px) et garde au-dessus de la barre. */
const RADIUS = 120;
const LIFT = 56;

export default function ActionDock() {
  const { dict } = useDictionary();
  const [shown, setShown] = useState(false);
  const [fan, setFan] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  /* La fenêtre de chat reste montée une fois ouverte : rouvrir reprend la conversation. */
  const [chatReady, setChatReady] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const networks = socialLinks(dict.site);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* L'éventail se referme au clic ailleurs et à Échap : un menu ouvert qu'on ne peut pas
     refermer est un piège. */
  useEffect(() => {
    if (!fan) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setFan(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFan(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [fan]);

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

  /* UNE seule écriture pour toute la barre : même hauteur, même graisse, même couleur. */
  const item =
    "flex h-11 items-center gap-2 px-3.5 text-sm font-light text-paper/75 transition-colors duration-300 hover:text-turquoise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise";
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
        {/* Le repère de l'éventail est le bord SUPÉRIEUR de la barre, EN SON MILIEU : les
            icônes partent de là, en absolu — donc sans agrandir la barre ni pousser la page. */}
        <div ref={dockRef} className="relative pointer-events-auto">
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
                  transitionDelay: fan ? `${i * 45}ms` : "0ms",
                }}
                /* `left-1/2` : l'ancre est le MILIEU de la barre — c'est ce qui garde l'arc
                   symétrique et entièrement dans l'écran. */
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
            className="flex items-center gap-1 bg-ink/85 p-1.5 text-paper ring-1 ring-paper/15 backdrop-blur-md shadow-lift"
          >
            {/* Les quatre actions du site, dans l'ordre où un visiteur les veut : devis,
                contact, assistant, réseaux. */}
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
              aria-controls="leegi-chat"
              aria-label={dict.ui.dock.chat}
              className={item}
            >
              <Spark className="h-4 w-4 shrink-0" />
              <span className={word}>{dict.ui.dock.chat}</span>
            </button>

            <button
              type="button"
              onClick={() => setFan((open) => !open)}
              aria-expanded={fan}
              aria-label={fan ? dict.ui.dock.closeSocials : dict.ui.dock.openSocials}
              title={dict.ui.dock.socials}
              className={`grid h-11 w-11 shrink-0 place-items-center text-paper/75 transition-colors duration-300 hover:text-turquoise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise ${
                fan ? "text-turquoise" : ""
              }`}
            >
              {fan ? <Close className="h-5 w-5" /> : <Share className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {chatReady && <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />}
    </>
  );
}
