"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Close, Menu, ChevronDown, ArrowRight } from "@/components/Icons";
import { switchLocalePath, type Locale } from "@/lib/dictionaries";
import { useDictionary } from "@/components/DictionaryProvider";
import HeaderSearch from "@/components/HeaderSearch";
import { usePageTransition } from "@/components/PageTransition";
import { lockScroll } from "@/lib/scroll";

const switchLabels: Record<Locale, { fr: string; en: string }> = {
  fr: { fr: "FR", en: "EN" },
  en: { fr: "FR", en: "EN" },
};

/**
 * Retire le focus de tout élément du header.
 *
 * Le mega menu Services n'a AUCUN état React : il s'ouvre et se ferme en CSS, par
 * `group-hover` et `group-focus-within` (voir le `div.group` de la navigation). Un clic sur
 * une entrée laissait donc le focus sur le lien cliqué : `focus-within` restait vrai, et le
 * panneau restait affiché par-dessus la page d'arrivée. On relâche le focus quand la route
 * change — et aussi au clic dans le panneau, pour le lien qui mène à la page où l'on est
 * déjà : là, la route ne change pas, donc l'effet de navigation ne se déclenche pas.
 */
function blurHeaderFocus() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest("header")) active.blur();
}

export default function Header() {
  const { dict, locale } = useDictionary();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();
  const { navigate } = usePageTransition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu plein écran : on met aussi Lenis en pause pour figer la page derrière.
  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    blurHeaderFocus();
  }, [pathname]);

  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  const changeLocale = (next: Locale) => {
    document.cookie = `leegi-locale=${next};path=/;max-age=31536000;samesite=lax`;
    navigate(switchLocalePath(next, pathname), next === "fr" ? "Français" : "English");
  };

  return (
    <>
      {/* La barre a DEUX comportements, et c'est voulu.

          Sur TELEPHONE : une barre d'ENCRE, toujours — la même que les panneaux plein écran
          (recherche, formulaire) et que le rideau de transition. Le logo clair y est lisible
          en permanence, alors qu'une barre transparente le faisait disparaître au-dessus des
          heros clairs des pages internes ; et la page ne « saute » plus au premier scroll,
          puisque le fond ne change pas.

          Sur GRAND ÉCRAN : le comportement d'origine — transparent au repos, blanc translucide
          une fois la page défilée — parce que le hero de l'accueil est sombre et que la barre y
          doit s'effacer. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-paper/10 bg-bg-white/85 py-2 backdrop-blur-xl lg:border-navy/8 lg:bg-white/85 lg:shadow-soft"
            : "border-b border-paper/10 bg-transparent py-3 lg:border lg:bg-transparent lg:py-4"
        }`}
      >
        <div className="max-w-[91rem] mx-auto flex items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-0">
          <Link href={href("/")} aria-label="LEEGI Group" className="relative z-10 flex items-center">
            {/* Deux logos, un par terrain : le clair dans la barre d'encre du téléphone, et
                celui qui suit l'état de la barre sur grand écran. Un `src` ne se change pas en
                CSS, donc les deux images coexistent et l'une est masquée. */}
            <Image
              src="/img/logo.png"
              alt="LEEGI Group"
              width={180}
              height={80}
              priority
              className="h-9 w-auto lg:hidden"
            />
            <Image
              src={scrolled ? "/img/logo-navy.png" : "/img/logo.png"}
              alt=""
              width={180}
              height={80}
              priority
              aria-hidden
              className="hidden h-16 w-auto transition-all duration-300 lg:block"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {dict.nav.map((item) =>
              item.href === "/services" ? (
                <div key={item.href} className="group text-lg font-normal">
                  <Link
                    href={href(item.href)}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors text-lg font-normal ${
                      scrolled ? "text-navy hover:text-brand text-lg font-normal" : "text-white/85 hover:text-white text-lg font-normal"
                    }`}
                  >
                    <span className="text-lg font-light">{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                  </Link>

                  {/* Mega menu Services : bandeau pleine largeur sous le header. */}
                  <div
                    onClick={blurHeaderFocus}
                    className="invisible absolute inset-x-0 top-full translate-y-2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  >
                    <div className="container-x">
                      <div className="grid gap-6 rounded-2xl border border-navy/8 bg-white p-6 shadow-lift lg:grid-cols-[1.6fr_1fr]">
                        <div className="grid content-start gap-1 sm:grid-cols-2">
                          {dict.services.map((s) => (
                            <Link
                              key={s.slug}
                              href={href(`/services/${s.slug}`)}
                              className="group/item rounded-xl px-4 py-3 transition-colors text-lg font-normal hover:bg-brand/[0.06]"
                            >
                              <span className="flex items-center justify-between gap-2 text-sm font-light text-navy">
                                {s.title}
                                <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-brand opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                              </span>
                              <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted">
                                {s.short}
                              </span>
                            </Link>
                          ))}
                        </div>

                        <div className="relative hidden overflow-hidden rounded-xl lg:block">
                          <Image
                            src="/img/partenaires.jpg"
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 0px, 360px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/45 to-navy-deep/10" />
                          <div className="relative flex h-full min-h-[13rem] flex-col justify-end gap-3 p-5">
                            <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-turquoise">
                              {dict.ui.expertise}
                            </span>
                            <p className="text-lg font-light leading-snug text-white">{dict.ui.talkToUs}</p>
                            <Link
                              href={href("/devis")}
                              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-light text-navy transition-transform duration-300 hover:-translate-y-0.5"
                            >
                              {dict.ui.freeQuote}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={href(item.href)}
                  className={`rounded-full px-4 py-2 text-lg font-light transition-colors ${
                    scrolled ? "text-navy hover:text-brand" : "text-white/85 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitch
              locale={locale}
              scrolled={scrolled}
              onChange={changeLocale}
              label={dict.ui.languageLabel}
            />

            <HeaderSearch scrolled={scrolled} />

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              className="grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-60 flex flex-col bg-ink text-paper grain lg:hidden">
          {/* Barre haute : le MÊME en-tête que les autres panneaux plein écran — logo clair,
              croix cerclée. Les trois surfaces du site (recherche, formulaire, menu) se
              ressemblent, on ne change pas de vocabulaire en changeant de panneau. */}
          <div className="container-x flex items-center justify-between py-4">
            <Image src="/img/logo.png" alt="LEEGI Group" width={150} height={60} className="h-9 w-auto" priority />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="grid h-11 w-11 place-items-center rounded-full text-paper/70 ring-1 ring-paper/20 transition-colors hover:text-paper hover:ring-paper/50"
            >
              <Close />
            </button>
          </div>

          {/* Le menu est une LISTE ÉDITORIALE : un numéro, un grand libellé, un filet — la
              grammaire des listes du site (services, valeurs, réalisations), tenue à l'échelle
              d'un menu de téléphone. Les liens ne sont plus des lignes muettes : chaque entrée
              se numérote et se souligne, comme une page de sommaire. */}
          <nav
            className="no-scrollbar container-x flex-1 overflow-y-auto pb-12"
            aria-label="Navigation mobile"
          >
            <ul className="mt-2 border-t border-paper/10">
              {dict.nav
                .filter((n) => n.href !== "/services")
                .map((item, i) => (
                  <li key={item.href} className="border-b border-paper/10">
                    <Link
                      href={href(item.href)}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-5 py-5"
                    >
                      <span className="text-[0.7rem] font-medium tabular-nums uppercase tracking-[0.2em] text-paper/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-light text-3xl text-paper transition-transform duration-500 group-hover:translate-x-1.5">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>

            {/* Services : la même ligne que les autres, mais dépliable. Le libellé porte
                l'accent (turquoise) — c'est la seule entrée qui a un contenu derrière. */}
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              className="flex w-full items-baseline gap-5 border-b border-paper/10 py-5 text-left"
            >
              <span className="text-[0.7rem] font-medium tabular-nums uppercase tracking-[0.2em] text-paper/35">
                {String(dict.nav.filter((n) => n.href !== "/services").length + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-light text-3xl text-turquoise">
                {dict.nav.find((n) => n.href === "/services")?.label}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 self-center text-paper/50 transition-transform duration-300 ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {servicesOpen && (
              <ul className="border-b border-paper/10">
                {dict.services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={href(`/services/${s.slug}`)}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between gap-4 border-b border-paper/[0.06] py-4 pl-9 last:border-b-0"
                    >
                      <span className="font-light text-lg text-paper/85">{s.title}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-paper/30" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex items-center gap-3">
              <LocaleSwitch
                locale={locale}
                scrolled={false}
                onChange={changeLocale}
                label={dict.ui.languageLabel}
                size="lg"
              />
              <Link
                href={href("/devis")}
                onClick={() => setOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-brand to-turquoise px-6 py-4 text-sm font-light text-white"
              >
                {locale === "fr" ? "Demander un devis" : "Get a quote"}
              </Link>
            </div>

            {/* Le pied du panneau : les coordonnées, en petites capitales — la même clôture
                que les panneaux de recherche et de contact. */}
            <div className="mt-10 flex flex-col gap-1 border-t border-paper/10 pt-6 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-paper/35">
              <a href={`mailto:${dict.site.email}`} className="transition-colors hover:text-paper">
                {dict.site.email}
              </a>
              <a href={dict.site.phoneRaw} className="transition-colors hover:text-paper">
                {dict.site.phone}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function LocaleSwitch({
  locale,
  scrolled,
  onChange,
  label,
  size = "sm",
}: {
  locale: Locale;
  scrolled: boolean;
  onChange: (l: Locale) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const labels = switchLabels[locale];
  const base =
    "inline-flex items-center rounded-full p-0.5 text-[0.68rem] font-light transition-colors bg-white/10 text-white/70";
  /* Le fond de la barre change sur GRAND ÉCRAN (blanc une fois défilé) et jamais sur
     téléphone (encre, toujours) : le ton de la pastille suit donc la barre, mais seulement à
     partir de `lg` — et en clair la pastille active reste blanche dans les deux cas. */
  const tone = scrolled ? "lg:bg-navy/[0.06] lg:text-muted" : "";
  const active = scrolled ? "bg-white text-navy lg:shadow-soft" : "bg-white text-navy";
  const pad = size === "lg" ? "py-2 px-1" : "py-1";

  return (
    <div className={`${base} ${tone} ${pad}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange("fr")}
        aria-current={locale === "fr" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "fr" ? active : `hover:text-white hover:opacity-80 ${scrolled ? "lg:hover:text-navy" : ""}`
        }`}
      >
        {labels.fr}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-current={locale === "en" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en" ? active : `hover:text-white ${scrolled ? "lg:hover:text-navy" : ""}`
        }`}
      >
        {labels.en}
      </button>
    </div>
  );
}