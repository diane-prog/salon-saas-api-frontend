import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import CtaBand from "@/components/CtaBand";
import { ProductPanel } from "@/components/ProductPanel";
import Reveal from "@/components/Reveal";
import { HeroSection } from "@/components/sections";
import { TextLink } from "@/components/ui";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";
import { BODY, LABEL, LEAD, ROW, RULE, TITLE } from "@/lib/editorial";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.aboutPage.title,
    description: dict.aboutPage.lead,
    alternates: { canonical: localePath(lang, "/a-propos") },
  };
}

/* L'échelle typographique et le filet viennent de `lib/editorial` : c'est le vocabulaire
 * commun à toutes les pages « galerie », il ne se réécrit pas ici. */

/** Enveloppe d'un panneau de la pile : plein cadre, contenu ramené dans les marges. */
const PANEL_INNER = "container-x py-10 sm:py-12";

/* Les quatre réglages de la pile. Ils sont posés ici, en variables CSS inline, plutôt que
 * dans `.stack-sections` (globals.css) qui ne garde que le mécanisme : une seule source
 * pour ces nombres, qu'on peut ajuster d'un coup d'œil à l'écran.
 *
 * La contrainte à respecter : un panneau recouvert ne reste collé que tant que le
 * conteneur descend plus bas que lui, et le suivant doit monter du bas de la fenêtre
 * jusqu'à son collage. Il faut donc `height + gap − step` < `100 − pin − 4 × step`.
 * Avec 50 + 6 − 2 = 54 svh pour 80 disponibles, il y a de la marge, même pour le panneau
 * « valeurs », le plus haut. */
const STACK = {
  "--stack-pin": "12svh",
  "--stack-step": "2svh",
  "--stack-height": "50svh",
  "--stack-gap": "6svh",
} as CSSProperties;

export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { about, aboutPage, ui } = dict;
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;
  const { mission, vision, why } = aboutPage;

  return (
    <div className="bg-paper text-ink">
      {/* Le hero est celui des autres pages internes (même bandeau photo, même échelle de
          titre). Son titre est celui du site de référence, et il n'a pas de chapô : comme
          là-bas, les deux phrases d'ouverture vivent dans le premier bloc de contenu. */}
      <HeroSection eyebrow={about.title} title={aboutPage.heroHeadline} />

      {/* ——— La pile ———
          Les cinq blocs de texte se recouvrent l'un après l'autre : chaque panneau se colle
          sous le header et le suivant glisse par-dessus, en laissant dépasser la bande du
          précédent. La mécanique (sticky, décalage des collages, hauteur des panneaux) est
          dans `app/globals.css`, sous `.stack-sections` ; ici, seulement le contenu.

          Le panneau de mission/vision a son filet vertical et son propre découpage, les
          autres partagent la disposition étiquette + contenu. Ni `Reveal` ni aucun autre
          `transform` sur ces panneaux : un `transform` sur un ancêtre annule son `sticky` —
          les révélations restent donc à l'intérieur.

          Réglages du recouvrement (collage, pas, hauteur, écart) : voir `.stack-sections`
          dans `app/globals.css`, où la contrainte de distance est expliquée. */}
      <div className="stack-sections" style={STACK}>
        {/* 01 — Qui sommes-nous ? (titre et phrases du site de référence) */}
        <section className={`border-t ${RULE}`}>
          <div className={PANEL_INNER}>
            <div className="grid gap-6 lg:grid-cols-12">
              <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{about.title}</span>
              <Reveal className="lg:col-span-9">
                <h2 className={`${TITLE} max-w-2xl`}>{aboutPage.title}</h2>
                <p className={`mt-6 ${LEAD} max-w-3xl`}>{aboutPage.lead}</p>
                <p className={`mt-5 max-w-3xl ${BODY} text-ink/65`}>{aboutPage.body}</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 02 — Nos fondations : des lignes de tableau, pas des cartes. */}
        <section className={`border-t ${RULE}`}>
          <div className={PANEL_INNER}>
            <div className="grid gap-6 lg:grid-cols-12">
              <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{aboutPage.pillarsTitle}</span>
              <ul className={`lg:col-span-9 border-t ${RULE}`}>
                {aboutPage.pillars.map((pillar, i) => (
                  <Reveal
                    as="li"
                    key={pillar.title}
                    delay={i * 70}
                    className={`group grid items-baseline gap-2 border-b py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8 ${RULE}`}
                  >
                    <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
                    <h3 className={`${ROW} transition-transform duration-500 group-hover:translate-x-1`}>
                      {pillar.title}
                    </h3>
                    <p className={`${BODY} text-ink/60`}>{pillar.body}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 03 — Mission / vision : deux blocs dans un seul panneau, coupés par un filet. */}
        <section className={`border-t ${RULE}`}>
          <div className={`container-x grid py-10 sm:py-12 lg:grid-cols-2`}>
            {[mission, vision].map((block, i) => (
              /* Le filet vertical est porté par le second bloc : `divide-x` demanderait une
                 couleur déclarée à part, alors que `border-navy/10` est déjà là. */
              <Reveal
                key={block.title}
                delay={i * 90}
                className={`${i === 1 ? `lg:border-l lg:border-navy/10 lg:pl-12` : "lg:pr-12"}`}
              >
                <span className={`${LABEL} text-ink/35`}>0{i + 1}</span>
                <h2 className={`mt-4 ${TITLE}`}>{block.title}</h2>
                <p className={`mt-5 max-w-xl ${LEAD} text-ink/70`}>{block.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 04 — Nos valeurs */}
        <section className={`border-t ${RULE}`}>
          <div className={PANEL_INNER}>
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <span className={`${LABEL} text-ink/45`}>{ui.whatDrivesUs}</span>
                <h2 className={`mt-4 ${TITLE}`}>{aboutPage.valuesTitle}</h2>
              </div>
              <ul className={`grid sm:grid-cols-2 lg:col-span-9 lg:border-t ${RULE}`}>
                {aboutPage.values.map((value, i) => (
                  <Reveal
                    as="li"
                    key={value.title}
                    delay={i * 70}
                    className={`border-b py-6 sm:odd:pr-10 sm:even:border-l sm:even:pl-10 ${RULE}`}
                  >
                    <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
                    <h3 className={`mt-3 ${TITLE}`}>{value.title}</h3>
                    <p className={`mt-3 max-w-sm ${BODY} text-ink/60`}>{value.body}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 05 — Pourquoi Belora : trois raisons, une ligne chacune. */}
        <section className={`border-t ${RULE}`}>
          <div className={PANEL_INNER}>
            <div className="grid gap-6 lg:grid-cols-12">
              <h2 className={`lg:col-span-3 max-w-sm ${TITLE}`}>{why.title}</h2>
              <ul className={`lg:col-span-9 lg:border-t ${RULE}`}>
                {why.items.map((item, i) => (
                  <Reveal
                    as="li"
                    key={item.title}
                    delay={i * 70}
                    className={`grid items-baseline gap-2 border-b py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8 ${RULE}`}
                  >
                    <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
                    <h3 className={ROW}>{item.title}</h3>
                    <p className={`${BODY} text-ink/60`}>{item.body}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* ——— Le produit, pas une promesse ———
          Ce bloc remplace deux sections qui n'appartenaient pas à ce produit : un
          programme de l'ancienne agence (photo d'un projet) et trois portraits de son
          équipe. Un logiciel se montre, il ne se raconte pas en trompe-l'œil : ici, le
          panneau est le produit (chiffres du mois), et les deux liens mènent aux
          fonctionnalités et aux tarifs. */}
      <section className={`border-t ${RULE}`}>
        <div className="container-x grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <span className={`${LABEL} text-ink/45`}>{aboutPage.title}</span>
            <h2 className={`mt-5 max-w-xl ${TITLE}`}>{aboutPage.productTitle}</h2>
            <p className={`mt-5 max-w-xl ${LEAD} text-ink/70`}>{aboutPage.productBody}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-4">
              <TextLink href={href("/services")} strong>
                {ui.viewAllServices}
              </TextLink>
              <TextLink href={href("/tarifs")}>{dict.nav.find((item) => item.href === "/tarifs")?.label ?? "Tarifs"}</TextLink>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5">
            <ProductPanel variant="numbers" />
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
