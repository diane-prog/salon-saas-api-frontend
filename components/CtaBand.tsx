"use client";

import SplitText from "@/components/SplitText";
import { TextLink } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, CLOSING, LABEL, LEAD, RULE } from "@/lib/editorial";

/**
 * Bandeau de conclusion, présent en bas de chaque page.
 *
 * Version « galerie » : plus de fond navy, plus de halos flous, plus de pastilles. Une
 * bande de papier, un filet, l'affirmation en grand corps à droite, les deux actions en
 * texte souligné, et les coordonnées en petites capitales dans la marge de gauche — la
 * même disposition que les autres sections du site (étiquette à gauche, contenu à droite),
 * pour que la fin de page ne soit pas un objet à part.
 *
 * Le titre reste révélé mot à mot par `SplitText` (déjà utilisé partout) : c'est la seule
 * animation de la bande.
 */
export default function CtaBand() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const { finalCta, site, ui } = dict;

  return (
    <section className={`border-t bg-paper ${RULE}`}>
      <div className="container-x py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Marge de gauche : l'étiquette, puis de quoi joindre l'agence sans passer par
              le formulaire — les coordonnées sont déjà dans le dictionnaire du site. */}
          <div className="lg:col-span-4">
            <span className={`${LABEL} text-ink/45`}>{ui.talkToUs}</span>
            <ul className={`mt-6 grid gap-2 ${BODY} text-ink/70`}>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors duration-300 hover:text-brand"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.phoneRaw}
                  className="transition-colors duration-300 hover:text-brand"
                >
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-8">
            <SplitText as="h2" text={finalCta.title} className={CLOSING} />
            <p className={`mt-6 max-w-xl ${LEAD} text-ink/70`}>{finalCta.body}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-4">
              <TextLink href={href("/devis")} strong>
                {finalCta.primary}
              </TextLink>
              <TextLink href={href("/contact")}>{finalCta.secondary}</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
