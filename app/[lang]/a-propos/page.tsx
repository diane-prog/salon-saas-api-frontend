import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import Reveal from "@/components/Reveal";
import { HeroSection } from "@/components/sections";
import { ArrowRight } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

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

/* Une seule échelle typographique pour la page, nommée ici une fois pour toutes.

   Étalon de la page : la section « fondations », dont les lignes (numéro, titre en
   `font-light` à 20 px, phrase en 15 px) donnent le ton. Tout le reste s'y range :
   `TITLE` ne la dépasse que d'un cran (24 px au lieu de 20), `LEAD` reste juste au-dessus
   du texte courant (≈17 px), `BODY` est le texte courant (15 px), `SUB` porte les noms de
   portrait (18 px) et `LABEL` les étiquettes en petites capitales spaced. Plus aucun gros
   corps : le seul grand titre de la page est celui du hero partagé. */
const TITLE = "font-light text-2xl leading-snug";
const LEAD = "text-[1.05rem] leading-[1.55]";
const BODY = "text-[0.95rem] leading-relaxed";
const ROW = "font-light text-xl";
const SUB = "font-light text-lg";
const LABEL = "text-[0.7rem] font-medium uppercase tracking-[0.2em]";

/* Filet de séparation : c'est le seul ornement de la page. Un gris froid très clair —
   `navy` à 10 %, ce qui donne ≈ #E3E2E3 une fois composé sur le papier — un cran plus
   soutenu que `--color-line` (#EDF2F7), qui se voyait à peine. Les traits doivent se
   deviner, pas encadrer. */
const RULE = "border-navy/10";
const DIVIDE = "lg:divide-navy/10";

/** Cadrage des photos. Elles restent en couleur : le noir et blanc était un des partis
    pris de la première version, il est abandonné. */
const PHOTO = "object-cover";

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
          titre), pour que la page ne se coupe pas du reste du site. Son titre est celui
          du site de référence, et le chapô reprend les deux phrases d'ouverture de la
          page d'origine. Comme sur le site de référence, le hero ne porte que le titre :
          les deux phrases d'ouverture sont ici, et ici seulement. */}
      <HeroSection eyebrow={about.title} title={aboutPage.heroHeadline} />

      {/* ——— Qui sommes-nous ———
          Deux colonnes : l'étiquette tient la marge gauche, le texte occupe la zone
          large, à la manière d'une fiche de salle. Le titre est celui du site de
          référence ; la phrase de tête et la suivante sont celles de la page d'origine,
          et non les textes de présentation de l'accueil (`about.heading` / `about.body`),
          qui n'appartiennent pas à cette page. */}
      <section className="container-x py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{about.title}</span>
          <Reveal className="lg:col-span-9">
            <h2 className={`${TITLE} max-w-2xl`}>{aboutPage.title}</h2>
            <p className={`mt-8 ${LEAD} max-w-3xl`}>{aboutPage.lead}</p>
            <p className={`mt-6 border-t pt-6 ${RULE} ${LEAD} max-w-3xl text-ink/70`}>
              {aboutPage.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— Fondations (trois piliers) ———
          Des lignes de tableau, pas des cartes : le numéro, le titre, la phrase. */}
      <section className="container-x pb-20 sm:pb-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <span className={`lg:col-span-3 ${LABEL} text-ink/45`}>{aboutPage.pillarsTitle}</span>
          <ul className={`lg:col-span-9 border-t ${RULE}`}>
            {aboutPage.pillars.map((pillar, i) => (
              <Reveal
                as="li"
                key={pillar.title}
                delay={i * 70}
                className={`group grid items-baseline gap-2 border-b py-7 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8 ${RULE}`}
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
      </section>

      {/* ——— Mission / vision ———
          Bande pleine largeur coupée par un filet vertical : deux blocs, aucune boîte. */}
      <section className={`border-y ${RULE}`}>
        {/* Le filet vertical vient du `divide-x` posé sur la grille ; en dessous de `lg`,
            les deux blocs s'empilent et sont séparés par un filet horizontal. */}
        <div className={`container-x grid lg:grid-cols-2 lg:divide-x ${DIVIDE}`}>
          {[mission, vision].map((block, i) => (
            <Reveal
              key={block.title}
              delay={i * 90}
              className={`border-t py-14 first:border-t-0 lg:border-t-0 lg:py-20 ${RULE} ${
                i === 1 ? "lg:pl-12" : "lg:pr-12"
              }`}
            >
              <span className={`${LABEL} text-ink/35`}>0{i + 1}</span>
              <h2 className={`mt-4 ${TITLE}`}>{block.title}</h2>
              <p className={`mt-5 max-w-xl ${LEAD} text-ink/70`}>{block.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— Initiatives ———
          Une seule image, tenue à gauche, le récit à droite : c'est la respiration de la
          page. Le titre du bloc de texte reste un nom propre, identique dans les deux
          langues, donc gardé tel quel dans les dictionnaires. */}
      <section className="container-x grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:gap-12">
        <figure className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.06]">
            <Image
              src="/img/projet-etincelles.jpg"
              alt={initiatives.name}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={PHOTO}
            />
          </div>
          <figcaption className={`mt-3 ${LABEL} text-ink/45`}>{initiatives.name}</figcaption>
        </figure>

        <Reveal delay={120} className="lg:col-span-7 lg:pt-10">
          <span className={`${LABEL} text-ink/45`}>{initiatives.title}</span>
          <h2 className={`mt-4 max-w-xl ${TITLE}`}>{initiatives.name}</h2>
          <div className={`mt-7 grid gap-5 sm:grid-cols-2 sm:gap-10 ${BODY} text-ink/65`}>
            <p>{initiatives.body}</p>
            <p>{initiatives.body2}</p>
          </div>
          <Link
            href={href("/realisations")}
            className={`group mt-9 inline-flex items-center gap-2 border-b border-ink/25 pb-1 transition-colors duration-300 hover:border-ink hover:text-brand ${BODY}`}
          >
            {ui.discover}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* ——— Valeurs ———
          Mêmes lignes que les fondations, mais sur deux colonnes et en plus grand : la
          page se souvient d'un rythme au lieu de le répéter à l'identique. */}
      <section className={`container-x border-t py-20 sm:py-28 ${RULE}`}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <span className={`${LABEL} text-ink/45`}>{ui.whatDrivesUs}</span>
            <h2 className={`mt-4 ${TITLE}`}>{aboutPage.valuesTitle}</h2>
          </div>
          <ul className={`grid border-t sm:grid-cols-2 lg:col-span-9 ${RULE}`}>
            {aboutPage.values.map((value, i) => (
              <Reveal
                as="li"
                key={value.title}
                delay={i * 70}
                className={`border-b py-8 sm:odd:pr-10 sm:even:border-l sm:even:pl-10 ${RULE}`}
              >
                <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
                <h3 className={`mt-3 ${TITLE}`}>{value.title}</h3>
                <p className={`mt-3 max-w-sm ${BODY} text-ink/60`}>{value.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— Équipe ———
          Trois portraits en pied, décalés verticalement, l'un d'eux portant une
          biographie longue : elle est repliée dans un `<details>` (sans JavaScript) pour
          que la page reste courte, et composée en colonnes de journal une fois ouverte. */}
      <section className={`border-t py-20 sm:py-28 ${RULE}`}>
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
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

      {/* ——— Pourquoi nous ———
          Le titre reste collé en haut de la colonne pendant que les trois raisons
          défilent : le lecteur garde le cadre sous les yeux. */}
      <section className={`border-t ${RULE}`}>
        <div className="container-x grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            {/* Titre de section repris du site de référence (`why.title`). Les clés
                `whyEyebrow` / `whyHeadline` disent autre chose et servent la grille de
                l'accueil : elles n'ont rien à faire ici. */}
            <div className="lg:sticky lg:top-28">
              <h2 className={`max-w-sm ${TITLE}`}>{why.title}</h2>
            </div>
          </div>
          <ul className={`lg:col-span-8 lg:border-t ${RULE}`}>
            {why.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 70}
                className={`grid items-baseline gap-2 border-b py-8 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8 ${RULE}`}
              >
                <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
                <h3 className={ROW}>{item.title}</h3>
                <p className={`${BODY} text-ink/60`}>{item.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
