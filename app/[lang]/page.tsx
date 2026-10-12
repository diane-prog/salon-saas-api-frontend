import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import HomeHero from "@/components/HomeHero";
import ServicesGlass from "@/components/ServicesGlass";
import ProjectStack from "@/components/ProjectStack";
import {
  ClientsMarquee,
  SplitShowcase,
  StatsSection,
  TestimonialsSection,
} from "@/components/sections";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;
  const { stats, about, clients, ui } = dict;

  return (
    <>
      <HomeHero />

      <StatsSection stats={stats} />

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <SplitShowcase
            eyebrow={about.title}
            title={about.heading}
            body={about.body}
            points={about.points}
            image="/img/partenaires.jpg"
            imageAlt="Leegi Group"
            href={href("/a-propos")}
            ctaLabel={ui.learnMore}
          />
        </div>
      </section>

      <ServicesGlass
        eyebrow={ui.expertise}
        title={lang === "fr" ? "Nos Services" : "Our Services"}
        body={
          lang === "fr"
            ? "Nous accompagnons les entreprises africaines et leurs partenaires à chaque étape de leur développement digital."
            : "We support African companies and their partners at every stage of their digital development."
        }
      />

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow={ui.portfolio}
            title={lang === "fr" ? "Nos réalisations" : "Our work"}
            body={
              lang === "fr"
                ? "Découvrez quelques-uns de nos projets qui ont transformé la présence digitale de nos clients."
                : "Discover some of the projects that have transformed our clients' digital presence."
            }
          />
          <div className="mt-14">
            <ProjectStack />
          </div>
          <Reveal className="mt-12 flex justify-center">
            <ButtonLink href={href("/realisations")} variant="outline">
              {ui.viewAllProjects}
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <SectionHeading eyebrow={ui.references} title={ui.clientsTitle} align="center" />
        </div>
        <div className="mt-12">
          <ClientsMarquee items={clients} />
        </div>
        <div className="container-x mt-10 flex justify-center">
          <Reveal>
            <Link
              href={href("/realisations")}
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              {ui.clientsLink}
            </Link>
          </Reveal>
        </div>
      </section>

      <TestimonialsSection />

      <CtaBand />
    </>
  );
}
