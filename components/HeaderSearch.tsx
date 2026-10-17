"use client";

import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import FullScreenPanel from "@/components/FullScreenPanel";
import { buildSearchEntries, searchEntries } from "@/lib/search";
import { LABEL } from "@/lib/editorial";

/** Nombre de suggestions montrées à l'ouverture, avant la première lettre tapée. */
const SUGGESTIONS = 5;

/**
 * Recherche plein écran, ouverte par l'icône du header.
 *
 * Le grand champ au milieu, sa règle qui passe au bleu de marque quand on écrit, et les
 * résultats en grandes lignes numérotées — la même grammaire que les listes éditoriales du
 * site (numéro, intitulé, groupe), mais en corps de titre. L'ouverture n'affiche pas un
 * écran vide : elle propose les premières entrées de l'index sous « Suggestions ».
 *
 * Le panneau lui-même (fond, en-tête, pied, Échap, Tab, focus, page figée) vient de
 * `FullScreenPanel`, partagé avec le formulaire de contact. Ici, ce qui est propre à la
 * recherche : l'index, la frappe, et le parcours au clavier des résultats — flèches pour
 * choisir, Entrée pour ouvrir.
 */
export default function HeaderSearch() {
  const { dict, locale } = useDictionary();
  const { services, projects, nav, ui, site } = dict;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  /** Ligne parcourue au clavier (ou survolée) : Entrée ouvre celle-là. */
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
  const searching = query.trim().length >= 2;
  const list = searching ? results : entries.slice(0, SUGGESTIONS);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openSearch = () => setOpen(true);

  const go = (href: string) => {
    close();
    router.push(href as never);
  };

  /* Une nouvelle frappe repart de la première ligne : sans cela, la sélection resterait sur
     un rang que le nouveau résultat ne contient plus. C'est fait ici, à la source de la
     valeur, plutôt que dans un effet sur `query` — un état reposé d'un effet relance un
     rendu pour rien. */
  const onQueryChange = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  /* Le clavier fait tout depuis le champ : flèches pour parcourir, Entrée pour ouvrir. La
     touche est traitée ICI et pas seulement par la soumission du formulaire : celle-ci
     dépend d'un « press » que tous les claviers (et l'autocomplétion, les IME) n'émettent pas
     de la même façon. `preventDefault` évite le double déclenchement avec `onSubmit`, qui
     reste pour un envoi par bouton. */
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const target = list[active] ?? list[0];
      if (target) go(target.href);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (list.length === 0) return;
    event.preventDefault();
    setActive((current) =>
      event.key === "ArrowDown"
        ? (current + 1) % list.length
        : (current - 1 + list.length) % list.length,
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ui.searchLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSearch}
        /* Sur téléphone la barre est d'encre, toujours : l'icône y reste donc claire, même
           une fois la page défilée. Sur grand écran, elle suit la barre (blanche translucide
           au défilement), d'où le décalage en `lg:`. */
        className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.06]"
      >
        <Search />
      </button>

      {open && (
        <FullScreenPanel
          label={ui.searchLabel}
          closeLabel={ui.searchCloseLabel}
          onClose={close}
          returnFocusTo={triggerRef}
          footer={
            <>
              <span>{ui.panelHint}</span>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-paper">
                {site.email}
              </a>
            </>
          }
        >
          <div className="container-x flex flex-1 flex-col justify-center pb-8">
            <span data-panel-in className={`${LABEL} text-paper/45`}>
              {ui.searchLabel}
            </span>

            <form
              data-panel-in
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                /* Garde-fou : une soumission qui arrive pendant la fermeture (fin de
                   séquence d'une touche) ne doit pas relancer une deuxième navigation. */
                if (!open) return;
                const target = list[active] ?? list[0];
                if (target) go(target.href);
              }}
              className="mt-7 border-b border-paper/20 pb-5 transition-colors duration-500 focus-within:border-brand"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <Search className="h-6 w-6 shrink-0 text-paper/35 sm:h-7 sm:w-7" />
                <label htmlFor="site-search" className="sr-only">
                  {ui.searchLabel}
                </label>
                <input
                  ref={inputRef}
                  id="site-search"
                  data-panel-autofocus
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  placeholder={ui.searchPlaceholder}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  aria-controls="site-search-results"
                  aria-activedescendant={list[active] ? `site-search-option-${active}` : undefined}
                  className="w-full bg-transparent font-light text-[clamp(1.6rem,4.6vw,3.25rem)] leading-[1.1] text-paper placeholder:text-paper/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
            </form>

            <p data-panel-in className={`mt-8 ${LABEL} text-paper/40`}>
              {searching ? `${ui.searchResults} · ${results.length}` : ui.searchSuggestions}
            </p>

            {/* `data-lenis-prevent` : Lenis écoute la molette sur tout le document et la
                consommerait — sans cette marque, la liste ne défilerait pas à la molette. */}
            <ul
              id="site-search-results"
              data-panel-in
              data-lenis-prevent
              className="no-scrollbar mt-2 max-h-[42svh] overflow-y-auto overscroll-contain"
            >
              {searching && results.length === 0 ? (
                <li className="py-6 font-light text-2xl text-paper/60">{ui.searchNoResults}</li>
              ) : (
                list.map((entry, index) => (
                  <li key={`${entry.group}-${entry.label}`}>
                    <Link
                      id={`site-search-option-${index}`}
                      href={entry.href as never}
                      onMouseEnter={() => setActive(index)}
                      onClick={close}
                      className={`group flex items-baseline gap-4 border-b border-paper/10 py-4 transition-colors duration-300 sm:gap-6 ${
                        index === active ? "bg-paper/[0.04]" : ""
                      }`}
                    >
                      <span
                        className={`${LABEL} tabular-nums transition-colors duration-300 ${
                          index === active ? "text-brand" : "text-paper/30"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-light text-xl leading-snug text-paper transition-transform duration-500 group-hover:translate-x-1.5 sm:text-2xl">
                        {entry.label}
                      </span>
                      <span
                        className={`${LABEL} shrink-0 transition-colors duration-300 ${
                          index === active ? "text-paper/70" : "text-paper/35"
                        }`}
                      >
                        {entry.group}
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                          index === active
                            ? "translate-x-0 text-brand opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </FullScreenPanel>
      )}
    </>
  );
}
