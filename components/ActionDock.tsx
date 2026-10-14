"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Close, Mail, Share, Spark } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { socialIcon, socialLinks } from "@/components/SocialIcons";
import ContactSheet from "@/components/ContactSheet";
import Chatbot from "@/components/Chatbot";

/**
 * Barre d'actions flottante, en bas de l'écran, révélée par le SCROLL.
 *
 * Pourquoi au scroll et pas d'emblée : en haut de page, le visiteur lit ; un pavé de boutons
 * posé sur le hero ne fait que masquer la photo. Dès qu'il descend — donc dès qu'il cherche
 * quelque chose — les trois issues du site se mettent à portée : le devis, le contact, et
 * l'assistant. Elle repart au retour en haut, par la même transition.
 *
 * Les trois actions ne sont pas de même nature, et l'objet le dit :
 * - `devis` est un LIEN (une page, celle du formulaire long) — c'est l'action principale, elle
 *   porte donc l'accent dégradé du site ;
 * - `contacter` ouvre le panneau de contact existant (`ContactSheet`, formulaire court) ;
 * - `assistant` ouvre la fenêtre de chat (`Chatbot`).
 *
 * L'ÉVENTAIL de réseaux : un bouton rond ouvre les logos officiels en demi-cercle AU-DESSUS de
 * lui, WhatsApp compris. La disposition est calculée : les icônes sont posées sur un arc de
 * 180° (de gauche à droite, jamais en bas), centré sur le bouton — donc aucune ne sort de
 * l'écran, aucune ne recouvre la barre d'actions, et l'écart angulaire constant (36° pour six
 * réseaux) garantit qu'elles ne se chevauchent pas. Réduire l'animation laisse le même
 * arrangement, sans les 500 ms de trajet.
 */

/** Rayon de l'éventail (px). Assez large pour six logos de 44 px, assez court pour tenir sur
    320 px de large : 2 × (104 + 22) = 252 px. */
const RADIUS = 104;

export default function ActionDock() {
  const { dict, locale } = useDictionary();
  const [shown, setShown] = useState(false);
  const [fan, setFan] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  /* La fenêtre de chat reste montée une fois ouverte : rouvrir reprend la conversation. */
  const [chatReady, setChatReady] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;
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

  const actionButton =
    "flex items-center gap-2 px-3.5 py-2.5 text-sm font-light transition-colors duration-300";

  return (
    <>
      <div
        ref={dockRef}
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-3 px-4 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
          shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* Éventail + déclencheur. Le bouton est CENTRÉ au-dessus de la barre : l'arc se déploie
            dans l'espace libre, sans jamais passer sous les actions. */}
        <div className="relative pointer-events-auto">
          {networks.map((network, i) => {
            const Icon = socialIcon(network.label);
            /* Arc de 180° partant de la GAUCHE (π) pour finir à la DROITE (2π) : en coordonnées
               d'écran, `sin` est alors négatif, donc les icônes montent. */
            const angle = Math.PI + (Math.PI / (networks.length - 1)) * i;
            const x = Math.cos(angle) * RADIUS;
            const y = Math.sin(angle) * RADIUS;
            return (
              <a
                key={network.label}
                href={network.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={network.label}
                title={network.label}
                /* Hors de l'éventail, les liens sont retirés du parcours clavier : ils sont
                   invisibles, donc invisibles pour un lecteur d'écran aussi. */
                tabIndex={fan ? undefined : -1}
                aria-hidden={!fan}
                style={{
                  transform: fan
                    ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    : "translate(-50%, -50%)",
                  transitionDelay: fan ? `${i * 45}ms` : "0ms",
                }}
                className={`absolute left-1/2 top-1/2 grid h-11 w-11 place-items-center bg-ink/90 text-paper/75 ring-1 ring-paper/15 backdrop-blur-md transition-[transform,opacity] duration-500 ease-out hover:text-turquoise hover:ring-turquoise/40 motion-reduce:transition-none ${
                  fan ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {Icon ? <Icon className="h-[1.15rem] w-[1.15rem]" /> : network.label.slice(0, 2)}
              </a>
            );
          })}

          <button
            type="button"
            onClick={() => setFan((open) => !open)}
            aria-expanded={fan}
            aria-label={fan ? dict.ui.dock.closeSocials : dict.ui.dock.openSocials}
            title={dict.ui.dock.socials}
            className="grid h-11 w-11 place-items-center bg-ink/85 text-paper/80 ring-1 ring-paper/15 backdrop-blur-md transition-colors duration-300 hover:text-turquoise hover:ring-turquoise/40"
          >
            {fan ? <Close className="h-5 w-5" /> : <Share className="h-5 w-5" />}
          </button>
        </div>

        {/* Les trois issues du site. */}
        <div
          role="group"
          aria-label={dict.ui.dock.title}
          className="flex items-center gap-1 bg-ink/85 p-1.5 text-paper ring-1 ring-paper/15 backdrop-blur-md shadow-lift"
        >
          <Link
            href={href("/devis")}
            className={`${actionButton} bg-gradient-to-r from-brand to-turquoise text-white hover:opacity-90`}
          >
            {dict.ui.dock.quote}
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {/* MÊME panneau de contact que la page contact : seule la pastille change. */}
          <ContactSheet
            labels={contactLabels}
            triggerClassName={`${actionButton} text-paper/75 hover:text-turquoise`}
            triggerContent={
              <>
                <Mail className="h-4 w-4" />
                {dict.ui.dock.contact}
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
            className={`${actionButton} text-paper/75 hover:text-turquoise`}
          >
            <Spark className="h-4 w-4" />
            {dict.ui.dock.chat}
          </button>
        </div>
      </div>

      {chatReady && <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />}
    </>
  );
}
