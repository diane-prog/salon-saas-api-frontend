"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Close, Menu, ArrowRight, ArrowUpRight } from "@/components/Icons";
import { switchLocalePath, type Locale } from "@/lib/dictionaries";
import { useDictionary } from "@/components/DictionaryProvider";
import { usePageTransition } from "@/components/PageTransition";
import { lockScroll } from "@/lib/scroll";
import { LABEL } from "@/lib/editorial";

const switchLabels: Record<Locale, { fr: string; en: string }> = {
  fr: { fr: "FR", en: "EN" },
  en: { fr: "FR", en: "EN" },
};

/**
 * Retire le focus de tout élément du header.
 *
 * Un clic sur un lien de la barre laissait le focus posé dessus après la navigation — l'entrée
 * active restait focalisée sur la page d'arrivée. On relâche le focus quand la route change.
 * (Le menu, lui, est une barre latérale avec état et retour de focus à lui — voir plus bas.)
 */
function blurHeaderFocus() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest("header")) active.blur();
}

export default function Header() {
  const { dict, locale } = useDictionary();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Le menu est une BARRE LATÉRALE À DROITE (`aside`), pas un plein écran : sur un menu de
     cinq entrées, un plein écran écrase la page et on perd le fil de ce qu'on quitte. Le
     panneau glisse depuis le bord droit, la page s'éteint derrière mais reste lisible.

     DEUX ÉTATS pour une seule intention, et c'est ce qui donne l'entrée ET la sortie :
     `open` dit « monté », `drawerShown` dit « en place ». Ouvert, il passe à `true` à la
     frame suivante — monté directement en place, le panneau n'aurait aucune transition à
     jouer et apparaîtrait d'un coup ; fermé, il passe à `false` et on laisse 560 ms à la
     sortie avant de démonter (`closeMenu`). */
  const [drawerShown, setDrawerShown] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);

  const openMenu = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
    window.requestAnimationFrame(() => setDrawerShown(true));
  }, []);

  /**
   * Ferme la barre latérale. `immediate` pour les gestes qui QUITTENT la page : il n'y a
   * rien à animer quand la navigation emporte déjà le document.
   */
  const closeMenu = useCallback((immediate = false) => {
    setDrawerShown(false);
    window.clearTimeout(closeTimer.current);
    if (immediate) {
      setOpen(false);
      return;
    }
    closeTimer.current = window.setTimeout(() => setOpen(false), 560);
  }, []);

  const pathname = usePathname();
  const { navigate } = usePageTransition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Barre latérale : on met aussi Lenis en pause pour figer la page derrière.
  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  /* Échap ferme, Tab reste DANS la barre, le focus part sur la croix à l'ouverture et
     revient sur le bouton du menu à la fermeture — au cycle suivant, comme dans
     `FullScreenPanel` : traité dans la foulée du geste qui ferme, la fin de la séquence de
     la touche rouvrait le panneau aussitôt. */
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    /* Le bouton est lu MAINTENANT (il est monté avant la barre) : dans le nettoyage,
       `ref.current` pourrait déjà pointer ailleurs. */
    const returnTo = hamburgerRef.current;

    const focusTimer = window.setTimeout(() => {
      drawer.querySelector<HTMLElement>("a[href], button")?.focus();
    }, 0);

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = drawer.querySelectorAll<HTMLElement>("a[href], button");
      if (focusables.length === 0) return;
      const start = focusables[0];
      const end = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && current === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && current === end) {
        event.preventDefault();
        start.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => returnTo?.focus());
    };
  }, [open, closeMenu]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    blurHeaderFocus();
  }, [pathname]);

  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  /* UNE SEULE BARRE, PARTOUT : le nom à gauche, le bouton de menu à droite, rien entre les
     deux. C'était la barre de l'accueil — une signature posée sur le plan vidéo ; c'est
     désormais celle de tout le site. Les liens, la langue et les actions de compte ne
     disparaissent pas : ils vivent dans la barre latérale que le bouton ouvre.

     LA BARRE EST TRANSPARENTE SUR TOUTES LES PAGES : toutes ouvrent sur le même plan vidéo,
     et une barre de papier posée dessus coupait le plan d'une bande claire dès le premier
     pixel. Le nom et le bouton passent donc au papier tant qu'on est en haut de la page — et
     le plan gagne en échange un voile de tête (`HeroBackdrop`), sans quoi un nom clair sur un
     haut de plan clair ne se lirait pas. Dès qu'on défile, la barre reprend son papier à
     95 % et son encre : à ce moment-là, on a quitté le plan.

     Aucune exception à prévoir pour la 404 : elle est rendue hors de la coquille du site,
     donc sans cette barre. */
  const overHero = !scrolled;

  const changeLocale = (next: Locale) => {
    /* Les panneaux du header se referment AVANT de partir. Changer de langue depuis le menu
       mobile laissait sinon le panneau par-dessus la page d'arrivée : l'écran restait couvert
       et il fallait actualiser. Ici, pas d'état à rattraper après coup — on referme à la
       source, dans le geste qui quitte la page. */
    closeMenu(true);
    document.cookie = `belora-locale=${next};path=/;max-age=31536000;samesite=lax`;
    /* `hard: true` : navigation PLEINE PAGE, et non `router.push`. Un changement de langue
       remonte tout `app/[lang]` — donc le composant de transition lui-même, et le drapeau de
       langue posé en cookie ne serait relu qu'après coup. En pleine page, le nouveau document
       est rendu d'emblée dans la bonne langue : rien à rattraper. */
    navigate(switchLocalePath(next, pathname), { hard: true });
  };

  return (
    <>
      {/* La barre est la même sur toutes les pages : nom à gauche, bouton à droite.

          ELLE S'EFFACE AU-DESSUS D'UN PLAN : les pages du site ouvrent toutes sur un hero
          vidéo, elle est donc transparente et son texte passe au papier, pour ne pas poser une
          bande claire sur le plan. Une fois la page défilée, elle reprend son fond de papier à
          95 % et son texte d'encre.

          POURQUOI PLUS DE FLOU D'ARRIÈRE-PLAN : la barre est FIXE, donc un `backdrop-filter`
          la force à re-flouter toute la largeur de l'écran à chaque image défilée, par-dessus
          une page entière.          C'était le poste le plus cher du défilement, pour un effet qu'on ne
          voyait presque pas sous un fond déjà translucide. `bg-paper/95` suffit. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-300 ${
          overHero
            ? "border-b border-transparent bg-transparent py-4 lg:py-6"
            : "border-b border-ink/10 bg-paper/95 py-2"
        }`}
      >
        {/* Aucun voile dans la barre : le plan reste intact jusqu'en haut, y compris
            derrière le nom et le menu. Le texte est donc en papier sur le plan — c'est
            le hero qui doit rester assez sombre en haut pour qu'il se lise. */}
        <div className="max-w-[91rem] mx-auto flex items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-0">
          <Link
            href={href("/")}
            aria-label={dict.site.name}
            className="relative z-10 flex items-center"
          >
            {/* Le nom de la maison, écrit — pas un logo emprunté à une autre activité. Il
                suit l'état de la barre : clair au-dessus du plan, encre une fois collé. */}
            <span
              className={`font-display text-[1.4rem] leading-none tracking-[-0.015em] transition-colors lg:hidden ${
                overHero ? "text-paper" : "text-ink"
              }`}
            >
              {dict.site.name}
            </span>

            <span
              className={`hidden font-display text-[1.45rem] leading-none tracking-[-0.015em] transition-colors lg:inline ${
                overHero ? "text-paper" : "text-ink"
              }`}
            >
              {dict.site.name}
              <span aria-hidden className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
          </Link>

          {/* Le seul geste de la barre. Les liens, la langue et les actions de compte sont
              dans la barre latérale qu'il ouvre : rien n'est perdu, tout est à un clic. */}
          <button
            ref={hamburgerRef}
            type="button"
            onClick={openMenu}
            aria-label={dict.ui.menuOpenLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`grid h-11 w-11 place-items-center transition-colors ${
              overHero ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-ink/5"
            }`}
          >
            <Menu />
          </button>
        </div>
      </header>

      {open && (
        <>
          {/* ——— LE VOILE : la page s'éteint derrière la barre latérale, mais ne disparaît
                  pas — on continue de voir ce qu'on quitte. Cliquer dessus ferme.

                  Un BOUTON et non un `div` cliquable : il porte un nom pour les lecteurs
                  d'écran, et `tabIndex -1` le garde hors de la boucle de tabulation (elle
                  vit dans le panneau, hors de son périmètre). */}
          <button
            type="button"
            onClick={() => closeMenu()}
            aria-label={dict.ui.menuCloseLabel}
            tabIndex={-1}
            className={`fixed inset-0 z-[55] cursor-default bg-ink/70 backdrop-blur-[3px] transition-opacity duration-500 motion-reduce:transition-none ${
              drawerShown ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* ——— LA BARRE LATÉRALE, à DROITE : pleine hauteur, glissée depuis le bord. Sa
                  largeur se plafonne à 30rem — au-delà, un menu de cinq entrées s'étale
                  plus qu'il ne se lit.

                  Trois étages, comme un vrai menu de côté : l'en-tête (la maison, la croix),
                  le sommaire qui défile seul si la fenêtre est courte (`data-lenis-prevent`
                  pour que la molette lui reste attachée), et le pied (langue, action,
                  coordonnées) qui ne défile jamais. */}
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.ui.menuNavLabel}
            className={`fixed inset-y-0 right-0 z-60 flex w-[min(30rem,88vw)] flex-col border-l border-paper/10 bg-ink text-paper transition-transform duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              drawerShown ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Le grain vit dans son propre cadre : `grain` pose `position: relative`, ce
                qui écraserait l'`absolute` du calque. */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="grain h-full w-full" />
            </div>

            {/* En-tête : le nom de la maison et la croix cerclée — le même vocabulaire que
                les autres surfaces du site (formulaire, méga menu). */}
            <div className="relative flex items-center justify-between border-b border-paper/10 px-6 py-4">
              <span className="font-display text-[1.3rem] leading-none tracking-[-0.015em] text-paper">
                {dict.site.name}
              </span>

              <span className="flex items-center gap-4">
                <span className="hidden text-[0.56rem] uppercase tracking-[0.18em] text-paper/25 sm:block">
                  {dict.ui.panelHint}
                </span>

                <button
                  type="button"
                  onClick={() => closeMenu()}
                  aria-label={dict.ui.menuCloseLabel}
                  className="grid h-10 w-10 place-items-center text-paper/70 ring-1 ring-paper/20 transition-colors hover:text-paper hover:ring-paper/50"
                >
                  <Close />
                </button>
              </span>
            </div>

          {/* ——— LE SOMMAIRE. Une liste éditoriale à l'échelle d'une colonne : numéro entre
                  crochets, grand libellé en display, filet. Chaque entrée ENTRE EN CASCADE
                  (décalage croissant, 55 ms d'écart) une fois la barre posée : c'est ce qui
                  distingue un menu qu'on ouvre d'un menu qui apparaît. */}
          <div
            data-lenis-prevent
            className="no-scrollbar relative flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto overscroll-contain px-6 pb-8 pt-7"
          >
            <nav aria-label={dict.ui.menuNavLabel}>
              <span className={`${LABEL} text-paper/30`}>{dict.ui.menuNavLabel}</span>

              <ul className="mt-5 border-t border-paper/10">
                {dict.nav.map((item, i) => (
                  <li
                    key={item.href}
                    style={{ transitionDelay: drawerShown ? `${120 + i * 55}ms` : "0ms" }}
                    className={`border-b border-paper/10 transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      drawerShown ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                    }`}
                  >
                    <Link
                      href={href(item.href)}
                      onClick={() => closeMenu(true)}
                      className="group flex items-baseline gap-3 py-4"
                    >
                      <span className="w-8 shrink-0 text-[0.56rem] font-medium tabular-nums tracking-[0.1em] text-paper/30 transition-colors duration-300 group-hover:text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="font-display text-[clamp(1.45rem,1.9vw,1.8rem)] leading-[1.06] tracking-[-0.02em] text-paper transition-[transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-brand">
                        {item.label}
                      </span>

                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 self-center text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Les six fonctionnalités, en liste courte : le menu mène aussi au métier,
                pas seulement aux pages. Elle arrive APRÈS le sommaire dans la cascade. */}
            <div
              style={{ transitionDelay: drawerShown ? `${140 + dict.nav.length * 55}ms` : "0ms" }}
              className={`transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                drawerShown ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className={`${LABEL} text-paper/30`}>{dict.ui.expertise}</span>
                <Link
                  href={href("/services")}
                  onClick={() => closeMenu(true)}
                  className="text-[0.6rem] uppercase tracking-[0.14em] text-paper/40 transition-colors hover:text-paper"
                >
                  {dict.ui.viewAllServices}
                </Link>
              </div>

              <ul className="mt-4 border-t border-paper/10">
                {dict.services.map((s, i) => (
                  <li key={s.slug} className="border-b border-paper/10">
                    <Link
                      href={href(`/services/${s.slug}`)}
                      onClick={() => closeMenu(true)}
                      className="group flex items-baseline gap-3 py-2.5 text-paper/60 transition-colors hover:text-paper"
                    >
                      <span className="text-[0.55rem] tabular-nums tracking-[0.1em] text-paper/25">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.95rem] font-light">{s.title}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 -translate-x-1 text-paper/25 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ——— LE PIED : langue et coordonnées. HORS de la zone qui défile — c'est ce
                  qui distingue une barre latérale d'une page : le geste à faire reste
                  toujours sous la main, quelle que soit la hauteur de la fenêtre. */}
          <div
            style={{ transitionDelay: drawerShown ? "480ms" : "0ms" }}
            className={`relative border-t border-paper/10 px-6 py-5 transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              drawerShown ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className={`${LABEL} text-paper/30`}>{dict.ui.languageLabel}</span>
              <LocaleSwitch
                locale={locale}
                onChange={changeLocale}
                label={dict.ui.languageLabel}
                tone="dark"
              />
            </div>

            {/* Les deux actions de compte : elles vivent ICI, et seulement ici — la barre ne
                garde que le nom et le bouton du menu, sur toutes les pages. */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={href("/login")}
                onClick={() => closeMenu(true)}
                className="border border-paper/25 px-4 py-3 text-center text-[0.64rem] font-medium uppercase tracking-[0.16em] text-paper/75 transition-colors hover:border-paper/60 hover:text-paper"
              >
                {dict.ui.login}
              </Link>

              <Link
                href={href("/register")}
                onClick={() => closeMenu(true)}
                className="bg-paper px-4 py-3 text-center text-[0.64rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brand hover:text-paper"
              >
                {dict.ui.freeQuote}
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-1 text-[0.7rem] uppercase tracking-[0.14em] text-paper/40">
              <a href={`mailto:${dict.site.email}`} className="transition-colors hover:text-paper">
                {dict.site.email}
              </a>
              <a href={dict.site.phoneRaw} className="transition-colors hover:text-paper">
                {dict.site.phone}
              </a>
            </div>
          </div>

          </aside>
        </>
      )}
    </>
  );
}

function LocaleSwitch({
  locale,
  onChange,
  label,
  size = "sm",
  tone = "light",
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
  label: string;
  size?: "sm" | "lg";
  /** `light` pour la barre de papier, `dark` pour les panneaux d'encre (le menu). */
  tone?: "light" | "dark";
}) {
  const labels = switchLabels[locale];
  /* Deux surfaces, deux jeux de couleurs : encre sur papier dans la barre, papier sur
     encre dans le menu. La pastille active s'inverse avec la surface. */
  const base = `inline-flex items-center p-0.5 text-[0.68rem] font-light transition-colors ${
    tone === "dark" ? "bg-paper/10 text-paper/60" : "bg-ink/[0.06] text-ink/60"
  }`;
  const active = tone === "dark" ? "bg-paper text-ink" : "bg-ink text-paper";
  const idleHover = tone === "dark" ? "hover:text-paper" : "hover:text-ink";
  const pad = size === "lg" ? "py-2 px-1" : "py-1";

  return (
    <div className={`${base} ${pad}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange("fr")}
        aria-current={locale === "fr" ? "true" : undefined}
        className={`px-2.5 py-1 transition-colors ${
          locale === "fr" ? active : idleHover
        }`}
      >
        {labels.fr}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-current={locale === "en" ? "true" : undefined}
        className={`px-2.5 py-1 transition-colors ${
          locale === "en" ? active : idleHover
        }`}
      >
        {labels.en}
      </button>
    </div>
  );
}