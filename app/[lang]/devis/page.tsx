import { notFound } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Field, FormShell, Select, TextArea } from "@/components/Form";
import { HeroSection } from "@/components/sections";
import { ArrowRight, Check } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.devisPage.title,
    description: dict.devisPage.lead,
    alternates: { canonical: localePath(lang, "/devis") },
  };
}

export default async function DevisPage({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { devisPage, ui } = dict;
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;

  return (
    <>
      <HeroSection eyebrow={ui.freeQuote} title={devisPage.title} body={devisPage.lead} />

      <section className="py-24 sm:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <Reveal>
            <div className="rounded-card border border-navy/8 bg-white p-7 shadow-soft sm:p-10">
              <h2 className="text-2xl font-semibold text-navy sm:text-3xl">{devisPage.formTitle}</h2>
              <p className="mt-2 text-sm text-muted">{devisPage.formBody}</p>

              <div className="mt-8">
                <FormShell note={devisPage.jsNote} submitLabel={devisPage.submit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={lang === "fr" ? "Nom" : "Last name"} name="lastname" required autoComplete="family-name" />
                    <Field label={lang === "fr" ? "Prénom Nom" : "First name"} name="firstname" required autoComplete="given-name" />
                    <Field label={lang === "fr" ? "Email" : "Email"} name="email" type="email" required autoComplete="email" />
                    <Field label={lang === "fr" ? "Téléphone" : "Phone"} name="phone" type="tel" required autoComplete="tel" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label={lang === "fr" ? "Service souhaité" : "Service required"}
                      name="service"
                      options={devisPage.serviceOptions}
                      placeholder={devisPage.servicePlaceholder}
                      required
                    />
                    <Field label={lang === "fr" ? "Délais souhaités" : "Desired timeline"} name="delai" />
                  </div>

                  <TextArea
                    label={lang === "fr" ? "Description du projet" : "Project description"}
                    name="description"
                    placeholder={lang === "fr" ? "Parlez-nous de votre projet…" : "Tell us about your project…"}
                  />
                </FormShell>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <div className="rounded-card border border-navy/8 bg-navy/[0.03] p-7">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-brand">
                  {devisPage.includeTitle}
                </h3>
                <ul className="mt-5 grid gap-4">
                  {devisPage.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-navy">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-card border border-navy/8 bg-white p-7 shadow-soft">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {ui.footerService}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {dict.services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={href(`/services/${s.slug}`)}
                        className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-brand/[0.06] hover:text-brand"
                      >
                        {s.title}
                        <ArrowRight className="h-4 w-4 text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
