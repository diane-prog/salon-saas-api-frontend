import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DevisSheet from "@/components/DevisSheet";
import Reveal from "@/components/Reveal";
import SocialLinks from "@/components/SocialLinks";
import { ProductPanel } from "@/components/ProductPanel";
import { HeroSection } from "@/components/sections";
import { ArrowRight } from "@/components/Icons";
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

                {/* Réseaux : icônes seules, WhatsApp compris — la même ligne que la page
                    contact (l'intitulé reste dans `aria-label`, cf. `SocialLinks`). */}
                <Reveal delay={160} className="mt-10">
                  <SocialLinks site={site} />
                </Reveal>
              </div>
            </div>

            {/* Colonne droite — ce que la proposition inclut, puis les services, puis la photo :
                la même descente que la page contact (blocs d'informations, photo). */}
            <div className="order-1 lg:order-2">
              <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
                {/* Ce que la proposition inclut : une TABLE de lignes séparées par des filets,
                    sans icône. Les pastilles cochées disaient « liste de courses » ; ici, il
                    s'agit d'engagements — donc des lignes numérotées comme un sommaire, dans
                    l'ordre où ils arrivent réellement dans la relation. Le numéro tient le
                    rythme et remplace l'icône : il ne décore pas, il ordonne. */}
                <div>
                  <dt className="text-sm text-muted">{devisPage.includeTitle}</dt>
                  <dd className="mt-3 border-t border-navy/12">
                    {devisPage.includes.map((item, index) => (
                      <span
                        key={item}
                        className="flex items-baseline gap-4 border-b border-navy/12 py-3.5 text-[0.95rem] font-medium text-navy"
                      >
                        <span className="w-5 shrink-0 text-xs tabular-nums text-navy/35">
                          {String(index + 1).padStart(2, "0")}
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

              {/* Un panneau produit plutôt qu'une photo de partenaires : ce que la
                  personne est en train de lire (réserver, choisir une prestation) est
                  montré, pas illustré par une image d'ambiance. */}
              <Reveal delay={120} className="mt-14">
                <ProductPanel variant="catalogue" />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
