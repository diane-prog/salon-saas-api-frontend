import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import CtaBand from "@/components/CtaBand";
import Reveal from "@/components/Reveal";
import { HeroSection } from "@/components/sections";
import { TextLink } from "@/components/ui";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";
import { BODY, LABEL, LEAD, PHOTO, ROW, RULE, SUB, TITLE } from "@/lib/editorial";

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
  const { mission, vision, initiatives, team, why } = aboutPage;
  const [director, ...others] = team;

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

        {/* 05 — Pourquoi nous choisir ? Titre du site de référence (`why.title`) et non les
            libellés de la grille d'accueil (`whyEyebrow` / `whyHeadline`). */}
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

      {/* ——— Nos initiatives ———
          Un seul geste, sobre : la page passe du papier au bleu nuit. L'image occupe la
          moitié gauche en plein cadre (aucun cadre, aucun arrondi), le texte la moitié
          droite sur le fond sombre, et le nom du programme — un nom propre, identique
          dans les deux langues — porte la section en grand corps. Sous `lg`, l'image
          devient une bande en haut et le texte suit : rien à réorganiser.

          C'est la seule section sombre du site, volontairement : elle marque le moment
          où la page parle de ce que l'agence porte elle-même. */}
      <section className="bg-navy">
        <div className="grid lg:grid-cols-2">
          <figure className="relative min-h-[52svh] lg:min-h-[78svh]">
            <Image
              src="/img/projet-etincelles.jpg"
              alt={initiatives.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={PHOTO}
            />
            <figcaption className={`absolute bottom-5 left-5 ${LABEL} text-white/60`}>
              {initiatives.name}
            </figcaption>
          </figure>

          <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
            <span className={`${LABEL} text-white/45`}>{initiatives.title}</span>
            <h2 className="max-w-xl font-light text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.08] text-white">
              {initiatives.name}
            </h2>
            <div className="grid max-w-xl gap-5 text-[0.95rem] leading-relaxed text-white/70 sm:grid-cols-2 sm:gap-10">
              <p>{initiatives.body}</p>
              <p>{initiatives.body2}</p>
            </div>
            <TextLink href={href("/realisations")} tone="navy" className="mt-3 w-fit">
              {ui.discover}
            </TextLink>
          </div>
        </div>
      </section>

      {/* ——— Équipe ———
          Trois portraits, décalés verticalement, l'un d'eux portant une biographie longue :
          repliée dans un `<details>` (sans JavaScript) pour que la page reste courte, et
          composée en colonnes de journal une fois ouverte. */}
      <section className={`border-t py-20 sm:py-28 ${RULE}`}>
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-12">
            <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{aboutPage.teamLabel}</span>
            <h2 className={`lg:col-span-9 max-w-2xl ${TITLE}`}>{aboutPage.teamIntro}</h2>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <figure className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
                <Image
                  src={director.image}
                  alt={director.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={PHOTO}
                />
              </div>
            </figure>

            <Reveal delay={100} className="lg:col-span-7">
              <h3 className={TITLE}>{director.name}</h3>
              <p className={`mt-3 ${LABEL} text-ink/45`}>{director.role}</p>
              {director.bio.length > 0 && (
                <>
                  <p className={`mt-6 ${LEAD} text-ink/75`}>{director.bio[0]}</p>
                  <details className={`group mt-7 border-t pt-5 ${RULE}`}>
                    <summary
                      className={`flex cursor-pointer list-none items-center justify-between gap-4 ${LABEL} text-ink/55 [&::-webkit-details-marker]:hidden`}
                    >
                      {aboutPage.readBio}
                      {/* Un glyphe, pas du texte : il garde la taille du corps de référence. */}
                      <span aria-hidden className={`text-base leading-none transition-transform duration-300 group-open:rotate-45`}>
                        +
                      </span>
                    </summary>
                    <div className="mt-6 sm:columns-2 sm:gap-10">
                      {director.bio.slice(1).map((paragraph) => (
                        <p key={paragraph.slice(0, 40)} className={`mb-4 break-inside-avoid ${BODY} text-ink/60`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-12 sm:grid-cols-2 lg:gap-16">
            {others.map((member, i) => (
              <Reveal as="li" key={member.name} delay={i * 90} className={i === 1 ? "lg:mt-24" : ""}>
                <figure>
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className={PHOTO}
                    />
                  </div>
                  <figcaption className={`mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t pt-4 ${RULE}`}>
                    <span className={SUB}>{member.name}</span>
                    <span className={`${LABEL} text-ink/45`}>{member.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
