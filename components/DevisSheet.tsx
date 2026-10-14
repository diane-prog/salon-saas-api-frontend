"use client";

import type { ReactNode } from "react";
import { Field, FormShell, Select, TextArea } from "@/components/Form";
import FormSheet from "@/components/FormSheet";
import { useDictionary } from "@/components/DictionaryProvider";

/**
 * Demande de devis : le MÊME panneau que le contact (`FormSheet`), avec les champs du devis —
 * service souhaité, délais, description du projet.
 *
 * Pourquoi un panneau et pas seulement la page `/devis` : le bouton « Devis » de la barre
 * d'actions apparaît au scroll, n'importe où, et doit ouvrir le formulaire sur place. Passer
 * par la page aurait fait quitter ce que le visiteur était en train de lire pour un
 * formulaire — l'inverse du but.
 */
export default function DevisSheet({
  triggerClassName,
  triggerContent,
  triggerLabel,
}: {
  triggerClassName?: string;
  triggerContent?: ReactNode;
  /** Intitulé du déclencheur : « Demander un devis » par défaut, celui de la page sur la page. */
  triggerLabel?: string;
}) {
  const { dict, locale } = useDictionary();
  const { devisPage } = dict;
  const fields = devisPage.fields;

  return (
    <FormSheet
      labels={{
        trigger: triggerLabel ?? dict.ui.dock.quote,
        title: devisPage.formTitle,
        body: devisPage.formBody,
        note: devisPage.jsNote,
        submit: devisPage.submit,
        successTitle: devisPage.successTitle,
        successBody: devisPage.successBody,
      }}
      triggerClassName={triggerClassName}
      triggerContent={triggerContent}
      fields={(tone) => (
        <FormShell
          tone={tone}
          note={devisPage.jsNote}
          submitLabel={devisPage.submit}
          successTitle={devisPage.successTitle}
          successBody={devisPage.successBody}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field tone={tone} label={fields.firstName} name="firstname" required autoComplete="given-name" />
            <Field tone={tone} label={fields.lastName} name="lastname" required autoComplete="family-name" />
            <Field tone={tone} label={fields.email} name="email" type="email" required autoComplete="email" />
            <Field tone={tone} label={fields.phone} name="phone" type="tel" required autoComplete="tel" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              tone={tone}
              label={fields.service}
              name="service"
              options={devisPage.serviceOptions}
              placeholder={devisPage.servicePlaceholder}
              required
            />
            <Field tone={tone} label={fields.timeline} name="timeline" />
          </div>

          <TextArea
            tone={tone}
            label={fields.description}
            name="description"
            placeholder={fields.descriptionPlaceholder}
          />
          {/* La langue du formulaire suit celle de la page : le champ caché part avec la
              demande, pour qu'une réponse parte dans la bonne langue. */}
          <input type="hidden" name="locale" value={locale} />
        </FormShell>
      )}
    />
  );
}
