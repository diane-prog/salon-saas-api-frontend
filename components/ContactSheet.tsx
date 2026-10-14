"use client";

import { Field, FormShell, TextArea } from "@/components/Form";
import FormSheet from "@/components/FormSheet";
import type { ReactNode } from "react";

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
 * Formulaire de contact : le panneau (plein écran sur grand écran, feuille latérale sur
 * téléphone) et les champs. La mécanique du panneau vit dans `FormSheet`, partagée avec le
 * devis — ici, seul le CONTENU du formulaire est décrit.
 */
export default function ContactSheet({
  labels,
  triggerClassName,
  triggerContent,
}: {
  labels: ContactSheetLabels;
  triggerClassName?: string;
  triggerContent?: ReactNode;
}) {
  return (
    <FormSheet
      labels={labels}
      triggerClassName={triggerClassName}
      triggerContent={triggerContent}
      fields={(tone) => (
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
      )}
    />
  );
}
