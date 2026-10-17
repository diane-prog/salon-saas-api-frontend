"use client";

import Link from "next/link";
import { ProductPanel } from "@/components/ProductPanel";
import Reveal from "@/components/Reveal";
import { HeroSection } from "@/components/sections";
import { ArrowRight } from "@/components/Icons";
import { TextLink } from "@/components/ui";
import { useDictionary } from "@/components/DictionaryProvider";
import type { Service } from "@/lib/dictionaries/fr";
import { BODY, CLOSING, LABEL, LEAD, ROW, RULE, TITLE } from "@/lib/editorial";

/**
 * Gabarit commun aux six pages de service.
 *
 * Version « galerie » : la présentation reste à gauche mais devient un bloc collant sans
 * barre dégradée ; « ce que nous proposons » passe de la liste à puces rondes sur fond navy
 * à une suite de lignes numérotées bord à bord ; la méthode abandonne ses pastilles
 * dégradées numérotées pour de simples lignes à filets ; la conclusion du service devient
 * une bande de papier avec deux actions en texte souligné ; et les autres services forment
 * une liste de filets au lieu de cartes ombrées.
 *
 * Aucun contenu n'a été inventé : ce sont les champs du dictionnaire (`whyTitle`,
 * `offerings`, `steps`, `ctaTitle`…) simplement remis en page. Les pages de service gardent
 * leur propre conclusion et n'appellent donc pas le bandeau commun `CtaBand`.
 */
/** Le panneau produit qui accompagne chaque page : le dessin de l'écran dont parle la page. */
const PANEL: Record<string, "agenda" | "booking" | "clients" | "catalogue" | "team" | "numbers"> = {
  agenda: "agenda",
  "reservation-en-ligne": "booking",
  "fiches-clients": "clients",
  prestations: "catalogue",
  equipe: "team",
  pilotage: "numbers",
};

export default function ServicePageTemplate({ service }: { service: Service }) {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;
  const others = dict.services.filter((s) => s.slug !== service.slug);
  const ui = dict.ui;

  return (
    <>
      {/* Hero clair commun à toutes les pages internes (photo `other-hero` en fond). */}
      <HeroSection eyebrow={ui.expertise} title={service.heroTitle} body={service.heroSubtitle} />

      <div className="bg-paper text-ink">
        {/* ——— Présentation : étiquette et titre collants dans la marge, texte à droite. */}
        <section className="container-x py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <span className={`${LABEL} text-ink/45`}>{ui.presentation}</span>
                <h2 className={`mt-4 max-w-sm ${TITLE}`}>{service.whyTitle}</h2>

                {/* Le produit, au lieu d'une photo : la page décrit un écran, elle le
                    montre. Décoratif (`aria-hidden` dans le panneau), le texte porte
                    l'information. */}
                <div className="mt-10 hidden lg:block">
                  <ProductPanel variant={PANEL[service.slug] ?? "agenda"} />
                </div>
              </div>
            </div>

            <Reveal className="lg:col-span-8">
              <p className={`max-w-3xl ${LEAD} text-ink/75`}>{service.whyBody}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-4">
                <TextLink href={href("/devis")} strong>
                  {ui.freeQuote}
                </TextLink>
                <TextLink href={href("/realisations")}>{ui.viewAllProjects}</TextLink>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ——— Ce que nous proposons : une ligne par prestation, numérotée. ——— */}
        <section className={`border-t ${RULE}`}>
          <div className="container-x py-20 sm:py-28">
            <div className="grid gap-8 lg:grid-cols-12">
              <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{ui.ourOffer}</span>
              <ul className={`lg:col-span-9 border-t ${RULE}`}>
                {service.offerings.map((item, i) => (
                  <Reveal
                    as="li"
                    key={item}
                    delay={i * 60}
                    className={`group grid items-baseline gap-2 border-b py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-8 ${RULE}`}
                  >
                    <span className={`${LABEL} tabular-nums text-ink/35`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`${ROW} transition-transform duration-500 group-hover:translate-x-1`}>
                      {item}
                    </span>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ——— Comment ça marche : le titre porte la section, les étapes sont des lignes. */}
        <section className={`border-t ${RULE}`}>
          <div className="container-x py-20 sm:py-28">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <span className={`${LABEL} text-ink/45`}>{ui.methodology}</span>
                <h2 className={`mt-4 ${TITLE}`}>{service.processLabel}</h2>
                <p className={`mt-4 max-w-xs ${BODY} text-ink/60`}>{service.processIntro}</p>
              </div>
              <ul className={`lg:col-span-9 border-t ${RULE}`}>
                {service.steps.map((step, i) => (
                  <Reveal
                    as="li"
                    key={step.title}
                    delay={i * 60}
                    className={`grid items-baseline gap-2 border-b py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8 ${RULE}`}
                  >
                    <span className={`${LABEL} tabular-nums text-ink/35`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className={ROW}>{step.title}</h3>
                    <p className={`${BODY} text-ink/60`}>{step.body}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ——— Conclusion du service : la seule affirmation en grand corps de la page. ——— */}
        <section className={`border-t ${RULE}`}>
          <div className="container-x py-20 sm:py-28">
            <span className={`${LABEL} text-ink/45`}>{ui.talkToUs}</span>
            <h2 className={`mt-6 max-w-3xl ${CLOSING}`}>{service.ctaTitle}</h2>
            <p className={`mt-6 max-w-xl ${LEAD} text-ink/70`}>{service.ctaBody}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-4">
              <TextLink href={href("/devis")} strong>
                {ui.discussProject}
              </TextLink>
              <TextLink href={href("/contact")}>{dict.finalCta.secondary}</TextLink>
            </div>
          </div>
        </section>

        {/* ——— Autres services : des lignes de filets, pas des cartes. ——— */}
        <section className={`border-t ${RULE}`}>
          <div className="container-x py-20 sm:py-24">
            <span className={`${LABEL} text-ink/45`}>
              {ui.otherServices}
            </span>
            <ul className={`mt-8 border-t ${RULE}`}>
              {others.map((other) => (
                <li key={other.slug} className={`border-b ${RULE}`}>
                  <Link
                    href={href(`/services/${other.slug}`)}
                    className="group flex items-baseline justify-between gap-6 py-5"
                  >
                    <span className={`${ROW} transition-transform duration-500 group-hover:translate-x-1`}>
                      {other.title}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
