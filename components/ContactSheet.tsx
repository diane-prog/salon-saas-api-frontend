"use client";

import { useState } from "react";
import { ArrowRight } from "@/components/Icons";
import { Field, FormShell, TextArea } from "@/components/Form";
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
 * Bouton « Nous contacter » de la page contact : il ouvre le formulaire dans un panneau
 * latéral (Sheet shadcn, voir `components/ui/sheet.tsx`).
 *
 * Le formulaire n'est monté qu'à l'ouverture — Radix monte le contenu à la demande — donc
 * l'état « message envoyé » de `FormShell` repart de zéro à chaque ouverture, et la page
 * reste légère pour qui ne clique jamais.
 */
export default function ContactSheet({ labels }: { labels: ContactSheetLabels }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
        >
          {labels.trigger}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{labels.title}</SheetTitle>
          <SheetDescription>{labels.body}</SheetDescription>
        </SheetHeader>

        <FormShell
          note={labels.note}
          submitLabel={labels.submit}
          successTitle={labels.successTitle}
          successBody={labels.successBody}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={labels.fields.firstName}
              name="firstname"
              required
              autoComplete="given-name"
            />
            <Field label={labels.fields.lastName} name="lastname" required autoComplete="family-name" />
          </div>
          <Field label={labels.fields.email} name="email" type="email" required autoComplete="email" />
          <Field label={labels.fields.subject} name="subject" required />
          <TextArea label={labels.fields.message} name="message" required />
        </FormShell>
      </SheetContent>
    </Sheet>
  );
}
