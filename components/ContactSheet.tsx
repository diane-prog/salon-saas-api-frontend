"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "@/components/Icons";
import { Field, FormShell, TextArea } from "@/components/Form";
import FullScreenPanel from "@/components/FullScreenPanel";
import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL } from "@/lib/editorial";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type ContactSheetLabels = {
  trigger: string;
  title: string;
  body: string;
  note: string;
  submit: string;
  successTitle: string;
  successBody: string;
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  };
};

/**
 * Les champs du formulaire, écrits UNE fois : les deux présentations les partagent, seul le
 * ton change — clair sur la feuille latérale, encre dans le panneau plein écran.
 */
function ContactFields({
  labels,
  tone,
}: {
  labels: ContactSheetLabels;
  tone: "light" | "dark";
}) {
  return (
    <FormShell
      tone={tone}
      note={labels.note}
      submitLabel={labels.submit}
      successTitle={labels.successTitle}
      successBody={labels.successBody}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field tone={tone} label={labels.fields.firstName} name="firstname" required autoComplete="given-name" />
        <Field tone={tone} label={labels.fields.lastName} name="lastname" required autoComplete="family-name" />
      </div>
      <Field tone={tone} label={labels.fields.email} name="email" type="email" required autoComplete="email" />
      <Field tone={tone} label={labels.fields.subject} name="subject" required />
      <TextArea tone={tone} label={labels.fields.message} name="message" required />
    </FormShell>
  );
}

/**
 * Bouton de contact : il ouvre le formulaire, dans un panneau PLEIN ÉCRAN sur grand écran
 * (le même objet que la recherche du header — `FullScreenPanel`), et dans une feuille
 * latérale (Sheet) sur petit écran.
 *
 * Pourquoi deux présentations : sur un grand écran, le formulaire mérite la scène entière —
 * les champs respirent, on les remplit au clavier sans jamais quitter le panneau. Sous `lg`,
 * une feuille qui glisse depuis la droite reste plus confortable au pouce, et c'est le
 * comportement d'origine.
 *
 * Le serveur ne connaît pas la largeur de la fenêtre : le rendu commence donc sur la feuille
 * (celle qui marche partout) et bascule après montage si l'écran est large. Les deux
 * présentations portent le MÊME bouton déclencheur, donc rien ne bouge à l'écran au moment
 * de la bascule. Le formulaire n'est monté qu'à l'ouverture, chez Radix comme ici : l'état
 * « message envoyé » repart de zéro à chaque fois, et la page reste légère pour qui ne
 * clique jamais.
 */
export default function ContactSheet({
  labels,
  triggerClassName,
  triggerContent,
}: {
  labels: ContactSheetLabels;
  /* Apparence du déclencheur : par défaut la pastille dégradée du site. La barre d'actions
     flottante passe sa propre classe et son propre contenu (icône + mot) pour rester dans sa
     grammaire — mais c'est le MÊME panneau, avec la même mécanique et le même focus. */
  triggerClassName?: string;
  triggerContent?: ReactNode;
}) {
  const { dict, locale } = useDictionary();
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={
        triggerClassName ??
        "group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
      }
    >
      {triggerContent ?? (
        <>
          {labels.trigger}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );

  if (desktop) {
    return (
      <>
        {trigger}
        {open && (
          <FullScreenPanel
            label={labels.title}
            closeLabel={locale === "fr" ? "Fermer le formulaire" : "Close the form"}
            onClose={() => setOpen(false)}
            returnFocusTo={triggerRef}
            footer={
              <>
                <span>{dict.ui.panelHint}</span>
                <a
                  href={`mailto:${dict.site.email}`}
                  className="transition-colors hover:text-paper"
                >
                  {dict.site.email}
                </a>
              </>
            }
          >
            {/* Le contenu défile s'il dépasse : `data-lenis-prevent` est indispensable ici —
                Lenis écoute la molette sur tout le document et la consommerait, la zone ne
                défilerait pas. Et `no-scrollbar` masque la barre : dans un panneau plein
                écran, elle tombait au beau milieu du noir et coupait la scène.

                Le contenu est présenté en COLONNE CENTRÉE (`mx-auto max-w-3xl`) : avant, il
                s'alignait sur la marge gauche du conteneur et, sur un écran large, toute la
                moitié droite du panneau restait vide — le formulaire se lisait de travers. */}
            <div
              data-lenis-prevent
              className="no-scrollbar container-x flex flex-1 flex-col justify-center overflow-y-auto overscroll-contain py-8"
            >
              <div className="mx-auto w-full max-w-3xl">
                <span data-panel-in className={`${LABEL} text-paper/45`}>
                  {labels.title}
                </span>
                <p
                  data-panel-in
                  className="mt-5 font-light text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.15] text-paper/75"
                >
                  {labels.body}
                </p>
                <div data-panel-in className="mt-10 w-full">
                  <ContactFields labels={labels} tone="dark" />
                </div>
              </div>
            </div>
          </FullScreenPanel>
        )}
      </>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{labels.title}</SheetTitle>
          <SheetDescription>{labels.body}</SheetDescription>
        </SheetHeader>

        <ContactFields labels={labels} tone="light" />
      </SheetContent>
    </Sheet>
  );
}
