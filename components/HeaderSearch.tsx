"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { buildSearchEntries, searchEntries } from "@/lib/search";

export default function HeaderSearch({ scrolled }: { scrolled: boolean }) {
  const { dict, locale } = useDictionary();
  const { services, projects, nav, ui } = dict;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(
    () =>
      buildSearchEntries(
        {
          services,
          projects,
          nav,
          groups: { expertise: ui.expertise, portfolio: ui.portfolio, presentation: ui.presentation },
        },
        locale,
      ),
    [services, projects, nav, ui.expertise, ui.portfolio, ui.presentation, locale],
  );

  const results = useMemo(() => searchEntries(entries, query), [entries, query]);
  const showResults = query.trim().length >= 2;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-label={ui.searchLabel}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
          scrolled ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
        }`}
      >
        <Search />
      </button>

      {open && (
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const first = results[0];
            if (!first) return;
            setOpen(false);
            setQuery("");
            router.push(first.href as never);
          }}
          className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-navy/8 bg-white p-3 shadow-lift"
        >
          <label htmlFor="header-search" className="sr-only">
            {ui.searchLabel}
          </label>
          <input
            ref={inputRef}
            id="header-search"
            type="search"
            autoComplete="off"
            value={query}
            placeholder={ui.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl bg-navy/[0.04] px-4 py-3 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
          />

          {showResults && (
            <ul className="mt-2 max-h-72 overflow-y-auto">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">{ui.searchNoResults}</li>
              ) : (
                results.map((result) => (
                  <li key={`${result.group}-${result.label}`}>
                    <Link
                      href={result.href as never}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-navy transition-colors hover:bg-brand/[0.06] hover:text-brand"
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
      )}
    </div>
  );
}
