"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { searchEntries, type SearchEntry } from "@/lib/search";

export default function HeroSearch() {
  const { dict, locale } = useDictionary();
  const { services, projects, nav, ui } = dict;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const entries = useMemo<SearchEntry[]>(() => {
    const prefix = (path: string) => `/${locale}${path === "/" ? "" : path}`;
    return [
      ...services.map((s) => ({
        label: s.title,
        href: prefix(`/services/${s.slug}`),
        group: ui.expertise,
      })),
      ...projects.map((p) => ({
        label: p.title,
        href: prefix("/realisations"),
        group: ui.portfolio,
      })),
      ...nav.map((n) => ({ label: n.label, href: prefix(n.href), group: ui.presentation })),
    ];
  }, [services, projects, nav, ui.expertise, ui.portfolio, ui.presentation, locale]);

  const results = useMemo(() => searchEntries(entries, query), [entries, query]);
  const showResults = open && query.trim().length >= 2;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const first = results[0];
        if (!first) return;
        setOpen(false);
        router.push(first.href as never);
      }}
      className="relative w-full max-w-xl"
    >
      <label htmlFor="hero-search" className="sr-only">
        {ui.searchLabel}
      </label>

      <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 shadow-lift">
        <Search className="h-5 w-5 shrink-0 text-muted" />
        <input
          id="hero-search"
          type="search"
          autoComplete="off"
          value={query}
          placeholder={ui.searchPlaceholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-navy placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          aria-label={ui.searchLabel}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {showResults && (
        <ul className="absolute inset-x-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-2xl bg-white p-2 shadow-lift">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">{ui.searchNoResults}</li>
          ) : (
            results.map((result) => (
              <li key={`${result.group}-${result.label}`}>
                <Link
                  href={result.href as never}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-navy transition-colors hover:bg-brand/[0.06] hover:text-brand"
                >
                  <span className="font-medium">{result.label}</span>
                  <span className="shrink-0 text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                    {result.group}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
