import { notFound } from "next/navigation";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import { HeroSection } from "@/components/sections";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { Bulb, Chart, Layers, Target } from "@/components/Icons";
import { isLocale, getDictionary, localePath } from "@/lib/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.aboutPage.title,
    description: dict.aboutPage.lead,
    alternates: { canonical: localePath(lang, "/a-propos") },
  };
}

const pillarIcons = [Target, Bulb, Chart];
const valueIcons = [Bulb, Target, Layers, SparkIcon];

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${className}`} aria-hidden>
      <path d="M12 3l2.1 5.4L19.5 10l-5.4 2.1L12 17.5l-2.1-5.4L4.5 10l5.4-1.6L12 3Z" />
    </svg>
  );
}

export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { aboutPage, about, ui } = dict;
  const href = (p: string) => `/${lang}${p === "/" ? "" : p}`;
  const { mission, vision, initiatives, why } = aboutPage;

  return (
    <>
      <HeroSection
        eyebrow={about.title}
        title={aboutPage.title}
        body={`${aboutPage.lead} ${aboutPage.body}`}
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <ul className="grid gap-5 md:grid-cols-3">
            {aboutPage.pillars.map((p, i) => {
              const Icon = pillarIcons[i];
              return (
                <Reveal as="li" key={p.title} delay={i * 80}>
                  <div className="glow-card h-full bg-white p-7 shadow-soft">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-turquoise text-white">
                      <Icon />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-navy">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy grain py-24 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-turquoise/20 blur-[110px] animate-drift" />
        </div>
        <div className="container-x relative grid gap-5 lg:grid-cols-2">
          {[mission, vision].map((block, i) => (
            <Reveal key={block.title} delay={i * 100}>
              <div className="h-full rounded-card border border-white/10 bg-white/[0.04] p-9 backdrop-blur transition-colors duration-300 hover:border-turquoise/40">
                <span className="text-5xl font-extrabold text-white/10">0{i + 1}</span>
                <h2 className="mt-3 text-2xl text-white">{block.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-slate-300">{block.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24 sm:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand/15 to-turquoise/15 blur-2xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] shadow-lift">
              <Image src="/img/projet-etincelles.jpg" alt="Étincelles des Marques" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="flex flex-col items-start gap-5">
              <Eyebrow>Étincelles des Marques</Eyebrow>
              <h2 className="text-3xl leading-[1.15] text-navy sm:text-4xl">{initiatives.title}</h2>
              <p className="text-base leading-relaxed text-muted">{initiatives.body}</p>
              <p className="text-base leading-relaxed text-muted">{initiatives.body2}</p>
              <ButtonLink href={href("/realisations")} variant="outline">
                {ui.discover}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy/[0.03] py-24 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={ui.whatDrivesUs} title={aboutPage.valuesTitle} />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutPage.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <Reveal as="li" key={v.title} delay={i * 70}>
                  <div className="glow-card h-full bg-white p-7 shadow-soft">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand/10 text-brand">
                      <Icon />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-navy">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={ui.teamEyebrow} title={aboutPage.teamIntro} align="center" />

          <div className="mt-14">
            <Reveal>
              <div className="grid gap-8 rounded-card border border-navy/8 bg-white p-8 shadow-soft lg:grid-cols-[18rem_1fr] lg:gap-12">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-navy/5">
                  <Image src={aboutPage.team[0].image} alt={aboutPage.team[0].name} fill sizes="(max-width: 1024px) 100vw, 288px" className="object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl text-navy">{aboutPage.team[0].name}</h3>
                  <p className="mt-1 text-sm font-medium text-brand">{aboutPage.team[0].role}</p>
                  <div className="mt-5 grid gap-4">
                    {aboutPage.team[0].bio.map((p) => (
                      <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-muted">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {aboutPage.team.slice(1).map((m, i) => (
                <Reveal as="li" key={m.name} delay={i * 90}>
                  <div className="glow-card flex h-full items-center gap-5 bg-white p-6 shadow-soft">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-navy/5">
                      <Image src={m.image} alt={m.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-navy">{m.name}</h3>
                      <p className="mt-1 text-sm text-muted">{m.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy grain py-24 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand/20 blur-[110px] animate-drift" />
        </div>
        <div className="container-x relative">
          <SectionHeading tone="dark" eyebrow={ui.ourStrengths} title={why.title} />
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {why.items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 80}>
                <div className="h-full rounded-card border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors duration-300 hover:border-turquoise/40">
                  <span className="text-xs font-medium tracking-[0.18em] text-turquoise">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
