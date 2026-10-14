import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DevisSheet from "@/components/DevisSheet";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import SocialLinks from "@/components/SocialLinks";
import { HeroSection } from "@/components/sections";
import { ArrowRight, Check } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.devisPage.title,
    description: dict.devisPage.lead,
    alternates: { canonical: localePath(lang, "/devis") },
  };
}

/* Les valeurs cliquables (réseaux) : même survol que le reste du site. */
const valueLinkCls =
  "transition-colors duration-300 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * Page devis. C'est la MÊME page que le contact — même hero clair, même grille en deux
 * colonnes, mêmes blocs d'informations à droite, même photo en bas à droite : un visiteur qui
 * passe de l'une à l'autre ne change pas de site. Seul le CONTENU change : ici l'accroche dit
 * le devis, l'action ouvre le formulaire de devis (les champs de projet : service, délais,
 * description), et la colonne de droite liste ce que la proposition inclut puis les services.
 *
 * La page devis ne portait pas le formulaire dans ses champs texte libres : elle le tient
 * maintenant dans le même panneau que partout ailleurs (`DevisSheet`), donc les champs y sont
 * écrits une seule fois — page, barre d'actions et pied de page ouvrent le même formulaire.
 */
export default async function DevisPage({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { devisPage, site, ui } = dict;
  const href = (path: string) => `/${lang}${path === "/" ? "" : path}`;

  return (
    <>
      <HeroSection eyebrow={ui.freeQuote} title={devisPage.title} body={devisPage.lead} />

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            {/* Colonne gauche — l'accroche en haut, l'action et les réseaux en bas, alignés sur
                le bas de la colonne de droite (`justify-between`). */}
            <div className="order-2 flex flex-col justify-between gap-16 lg:order-1">
              <Reveal>
                <h2 className="max-w-sm font-light text-2xl leading-[1.15] text-navy/80 sm:text-[1.75rem] lg:text-[2.25rem]">
                  {devisPage.formTitle}
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{devisPage.formBody}</p>
              </Reveal>

              <div>
                <Reveal delay={80}>
                  <DevisSheet triggerLabel={devisPage.submit} />
                </Reveal>

                {/* Réseaux : logos officiels + intitulé, WhatsApp compris — la même ligne
                    que la page contact. */}
                <Reveal delay={160} className="mt-10">
                  <SocialLinks site={site} />
                </Reveal>
              </div>
            </div>

            {/* Colonne droite — ce que la proposition inclut, puis les services, puis la photo :
                la même descente que la page contact (blocs d'informations, photo). */}
            <div className="order-1 lg:order-2">
              <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted">{devisPage.includeTitle}</dt>
                  <dd className="mt-2 grid gap-3">
                    {devisPage.includes.map((item) => (
                      <span
                        key={item}
                        className="flex items-start gap-3 text-[0.95rem] font-medium text-navy"
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted">{ui.footerService}</dt>
                  <dd className="mt-2 grid gap-2">
                    {dict.services.map((service) => (
                      <Link
                        key={service.slug}
                        href={href(`/services/${service.slug}`)}
                        className={`group inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-navy ${valueLinkCls}`}
                      >
                        {service.title}
                        <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </dd>
                </div>
              </dl>

              <Reveal delay={120} className="mt-14">
                <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[10/9]">
                  {/* Cadre fermé : l'échelle couvre le débattement (±4 % → 1,09). */}
                  <Parallax className="absolute inset-0" amount={4} scale={1.09}>
                    <Image
                      src="/img/partenaires.jpg"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </Parallax>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
