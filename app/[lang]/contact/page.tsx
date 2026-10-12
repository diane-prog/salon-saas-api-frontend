import { notFound } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Field, FormShell, TextArea } from "@/components/Form";
import { HeroSection } from "@/components/sections";
import { Check, Clock, Mail, Phone, Pin } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.contactPage.title,
    description: dict.contactPage.lead,
    alternates: { canonical: localePath(lang, "/contact") },
  };
}

const icons = [Mail, Phone, Pin, Clock];

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { contactPage, site } = dict;
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;

  return (
    <>
      <HeroSection eyebrow={dict.ui.talkToUs} title={contactPage.title} body={contactPage.lead} />

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactPage.info.map((item, i) => {
              const Icon = icons[i];
              const content = (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-turquoise text-white">
                    <Icon />
                  </span>
                  <h3 className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-base font-light text-navy">{item.value}</p>
                </>
              );

              return (
                <Reveal as="li" key={item.label} delay={i * 70} className="h-full">
                  {item.href ? (
                    <a href={item.href} className="glow-card block h-full bg-white p-6 shadow-soft">
                      {content}
                    </a>
                  ) : (
                    <div className="glow-card h-full bg-white p-6 shadow-soft">{content}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
            <Reveal>
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
                  {lang === "fr" ? "Formulaire" : "Form"}
                </span>
                <h2 className="text-3xl leading-[1.15] text-navy sm:text-4xl">{contactPage.formTitle}</h2>
                <p className="max-w-md text-sm leading-relaxed text-muted">{contactPage.formBody}</p>
                <ul className="mt-4 grid gap-3">
                  {contactPage.formPoints.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-medium text-navy">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-card border border-navy/8 bg-navy/[0.02] p-7 sm:p-9">
                <FormShell note={contactPage.jsNote} submitLabel={contactPage.submit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={lang === "fr" ? "Nom" : "Last name"} name="lastname" required autoComplete="family-name" />
                    <Field label={lang === "fr" ? "Prénom Nom" : "First name"} name="firstname" required autoComplete="given-name" />
                  </div>
                  <Field label={lang === "fr" ? "E-mail" : "Email"} name="email" type="email" required autoComplete="email" />
                  <Field label={lang === "fr" ? "Sujet" : "Subject"} name="subject" required />
                  <TextArea label={lang === "fr" ? "Message" : "Message"} name="message" required />
                </FormShell>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-16">
            <div className="relative overflow-hidden rounded-card border border-navy/8 bg-navy/[0.03] p-10 text-center sm:p-14">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/20 blur-[90px]" />
              </div>
              <div className="relative flex flex-col items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-brand shadow-soft">
                  <Pin className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-light text-navy">{contactPage.locationTitle}</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted">{contactPage.locationBody}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={site.phoneRaw}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-turquoise px-6 py-3 text-sm font-light text-white shadow-soft transition-all hover:-translate-y-0.5"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phone}
                  </a>
                  <Link
                    href={href("/devis")}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-light text-navy ring-1 ring-navy/12 transition-all hover:ring-brand hover:text-brand"
                  >
                    {dict.finalCta.primary}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
