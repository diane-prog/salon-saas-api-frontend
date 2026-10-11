"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";

export default function Footer() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-slate-300">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand/15 blur-[110px]" />

      <div className="container-x relative">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <Image src="/img/logo.png" alt="LEEGI Group" width={160} height={64} className="h-11 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{dict.site.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {dict.site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-brand hover:to-turquoise hover:text-white"
                >
                  {s.label.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
              {dict.ui.footerQuickLinks}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              {dict.nav.map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} className="text-slate-400 transition-colors hover:text-turquoise">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
              {dict.ui.footerService}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              {dict.services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={href(`/services/${s.slug}`)}
                    className="text-slate-400 transition-colors hover:text-turquoise"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
              {dict.ui.footerQuickLinks}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              <li>
                <a href={dict.site.phoneRaw} className="text-slate-400 transition-colors hover:text-turquoise">
                  {dict.site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${dict.site.email}`} className="text-slate-400 transition-colors hover:text-turquoise">
                  {dict.site.email}
                </a>
              </li>
              <li className="text-slate-400">{dict.site.address}</li>
            </ul>
            <Link
              href={href("/devis")}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-turquoise transition-colors hover:text-white"
            >
              {locale === "fr" ? "Demander un devis" : "Get a quote"}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 leegigroup</p>
          <p>{dict.site.address}</p>
        </div>
      </div>
    </footer>
  );
}