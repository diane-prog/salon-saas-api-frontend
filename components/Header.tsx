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

  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  const changeLocale = (next: Locale) => {
    document.cookie = `leegi-locale=${next};path=/;max-age=31536000;samesite=lax`;
    navigate(switchLocalePath(next, pathname), next === "fr" ? "Français" : "English");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-navy/8 bg-white/85 py-2 shadow-soft backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-4"
        }`}
      >
        <div className="max-w-[90rem] mx-auto flex items-center justify-between gap-6">
          <Link href={href("/")} aria-label="LEEGI Group" className="relative z-10 flex items-center">
            <Image
              src={scrolled ? "/img/logo-navy.png" : "/img/logo.png"}
              alt="LEEGI Group"
              width={180}
              height={80}
              priority
              className={`w-auto transition-all duration-300 ${scrolled ? "h-8" : "h-14"}`}
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
                    <span className="text-lg font-normal">{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                  </Link>

                  {/* Mega menu Services : bandeau pleine largeur sous le header. */}
                  <div className="invisible absolute inset-x-0 top-full translate-y-2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="container-x">
                      <div className="grid gap-6 rounded-2xl border border-navy/8 bg-white p-6 shadow-lift lg:grid-cols-[1.6fr_1fr]">
                        <div className="grid content-start gap-1 sm:grid-cols-2">
                          {dict.services.map((s) => (
                            <Link
                              key={s.slug}
                              href={href(`/services/${s.slug}`)}
                              className="group/item rounded-xl px-4 py-3 transition-colors text-lg font-normal hover:bg-brand/[0.06]"
                            >
                              <span className="flex items-center justify-between gap-2 text-sm font-semibold text-navy">
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
                            <p className="text-lg font-semibold leading-snug text-white">{dict.ui.talkToUs}</p>
                            <Link
                              href={href("/devis")}
                              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy transition-transform duration-300 hover:-translate-y-0.5"
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
                  className={`rounded-full px-4 py-2 text-lg font-normal transition-colors ${
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
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden ${
                scrolled ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
              }`}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-60 flex flex-col bg-navy grain lg:hidden">
          <div className="container-x flex items-center justify-between py-4">
            <Image src="/img/logo.png" alt="LEEGI Group" width={150} height={60} className="h-9 w-auto" priority />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10"
            >
              <Close />
            </button>
          </div>

          <nav className="container-x flex-1 overflow-y-auto pb-10" aria-label="Navigation mobile">
            <ul className="flex flex-col gap-1 pt-6">
              {dict.nav
                .filter((n) => n.href !== "/services")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={href(item.href)}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-2xl font-semibold text-white/90"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>

            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              className="mt-2 flex w-full items-center justify-between py-3 text-2xl font-semibold text-turquoise"
            >
              {dict.nav.find((n) => n.href === "/services")?.label}
              <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            {servicesOpen && (
              <ul className="grid gap-1 pb-4">
                {dict.services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={href(`/services/${s.slug}`)}
                      onClick={() => setOpen(false)}
                      className="block border-l-2 border-brand/40 py-2 pl-4 text-base text-slate-300"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex items-center gap-3">
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
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-brand to-turquoise px-6 py-4 text-sm font-semibold text-white"
              >
                {locale === "fr" ? "Demander un devis" : "Get a quote"}
              </Link>
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
    "inline-flex items-center rounded-full p-0.5 text-[0.68rem] font-semibold transition-colors";
  const tone = scrolled ? "bg-navy/[0.06] text-muted" : "bg-white/10 text-white/70";
  const active = scrolled ? "bg-white text-navy shadow-soft" : "bg-white text-navy";
  const pad = size === "lg" ? "py-2 px-1" : "py-1";

  return (
    <div className={`${base} ${tone} ${pad}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange("fr")}
        aria-current={locale === "fr" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "fr" ? active : "hover:text-navy hover:opacity-80"
        }`}
      >
        {labels.fr}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-current={locale === "en" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en" ? active : scrolled ? "hover:text-navy" : "hover:text-white"
        }`}
      >
        {labels.en}
      </button>
    </div>
  );
}