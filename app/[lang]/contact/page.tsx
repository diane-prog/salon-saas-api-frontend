import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContactSheet from "@/components/ContactSheet";
import Reveal from "@/components/Reveal";
import { HeroSection } from "@/components/sections";
import { ArrowUpRight } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.contactPage.title,
    description: dict.contactPage.lead,
    alternates: { canonical: localePath(lang, "/contact") },
  };
}

/* Les valeurs cliquables (e-mail, téléphone) : même survol que le reste du site, le texte
   passe au bleu de marque. */
const valueLinkCls =
  "transition-colors duration-300 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { contactPage, site } = dict;
  const form = contactPage.form;

  return (
    <>
      {/* Hero clair habituel des pages internes, en tête de page. */}
      <HeroSection eyebrow={dict.ui.talkToUs} title={contactPage.title} body={contactPage.lead} />

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            {/* Colonne gauche — le titre et la phrase d'accroche en haut, le bouton et les
                réseaux en bas, alignés sur le bas de la photo de la colonne de droite :
                `justify-between` s'appuie sur la hauteur de la ligne de grille, donnée par
                cette colonne de droite. Le titre est un `h2` et il dit autre chose que le
                `h1` du hero, qui porte déjà « Contact » : pas de redite à l'écran. Il
                reste un cran SOUS le titre du hero — plus petit, et dans un gris ardoise
                (`navy/80`) plutôt que dans le bleu nuit plein, qui vire au noir. */}
            <div className="order-2 flex flex-col justify-between gap-16 lg:order-1">
              <Reveal>
                <h2 className="max-w-sm font-light text-2xl leading-[1.15] text-navy/80 sm:text-[1.75rem] lg:text-[2.25rem]">
                  {contactPage.heading}
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{contactPage.lead}</p>
              </Reveal>

              <div>
                <Reveal delay={80}>
                  <ContactSheet
                    labels={{
                      trigger: contactPage.cta,
                      title: form.title,
                      body: form.body,
                      note: form.jsNote,
                      submit: form.submit,
                      successTitle: form.successTitle,
                      successBody: form.successBody,
                      fields: {
                        firstName: form.firstName,
                        lastName: form.lastName,
                        email: form.email,
                        subject: form.subject,
                        message: form.message,
                      },
                    }}
                  />
                </Reveal>

                <Reveal delay={160} className="mt-10">
                  <ul className="flex flex-wrap gap-x-8 gap-y-2">
                    {site.socials.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group inline-flex items-center gap-1 text-sm text-navy ${valueLinkCls}`}
                        >
                          {social.label}
                          <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>

            {/* Colonne droite — coordonnées puis photo. Elle passe en premier sur mobile,
                pour que les coordonnées se lisent avant les actions. */}
            <div className="order-1 lg:order-2">
              <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
                {contactPage.info.map((item) => (
                  <div key={item.label}>
                    <dt className="text-sm text-muted">{item.label}</dt>
                    <dd className="mt-2 text-[0.95rem] font-medium text-navy">
                      {item.href ? (
                        <a href={item.href} className={valueLinkCls}>
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <Reveal delay={120} className="mt-14">
                <div className="relative aspect-[16/11] overflow-hidden rounded-card sm:aspect-[16/9]">
                  <Image
                    src="/img/partenaires.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
