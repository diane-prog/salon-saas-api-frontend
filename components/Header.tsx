"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductPanel } from "@/components/ProductPanel";
import { usePathname } from "next/navigation";
import { Close, Menu, ChevronDown, ArrowRight, ArrowUpRight } from "@/components/Icons";
import { switchLocalePath, type Locale } from "@/lib/dictionaries";
import { useDictionary } from "@/components/DictionaryProvider";
import FullScreenPanel from "@/components/FullScreenPanel";
import { TextLink } from "@/components/ui";
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
 * (Le mega menu Services n'est plus en CSS `group-hover` : c'est un panneau plein écran avec
 * état et retour de focus à lui — voir plus bas.)
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

  /* Mega menu Services : un VRAI dialogue plein écran (`FullScreenPanel`), plus un panneau
     CSS survolé. L'état vit ici, avec le déclencheur qui reprend le focus à la fermeture. */
  const [servicesPanel, setServicesPanel] = useState(false);
  const servicesTriggerRef = useRef<HTMLButtonElement>(null);
  const closeServicesPanel = useCallback(() => setServicesPanel(false), []);
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

  /* SUR L'ACCUEIL, la barre n'est pas la barre du site : c'est une signature posée sur la
     vidéo du hero — le nom à gauche, le menu à droite, rien entre les deux. Dès qu'on
     descend, ou dès qu'on quitte l'accueil, elle redevient la barre complète (liens,
     langue, actions de compte) et retrouve son fond de papier. */
  const overHero = pathname === `/${locale}` && !scrolled;

  const changeLocale = (next: Locale) => {
    /* Les panneaux du header se referment AVANT de partir. Changer de langue depuis le menu
       mobile laissait sinon le panneau par-dessus la page d'arrivée : l'écran restait couvert
       et il fallait actualiser. Ici, pas d'état à rattraper après coup — on referme à la
       source, dans le geste qui quitte la page. */
    closeMenu(true);
    setServicesPanel(false);
    document.cookie = `belora-locale=${next};path=/;max-age=31536000;samesite=lax`;
    /* `hard: true` : navigation PLEINE PAGE, et non `router.push`. Un changement de langue
       remonte tout `app/[lang]` — donc le composant de transition lui-même, et le drapeau de
       langue posé en cookie ne serait relu qu'après coup. En pleine page, le nouveau document
       est rendu d'emblée dans la bonne langue : rien à rattraper. */
    navigate(switchLocalePath(next, pathname), { hard: true });
  };

  return (
    <>
      {/* La barre a DEUX comportements, et c'est voulu.

          Sur TELEPHONE : une barre d'ENCRE, toujours — la même que les panneaux plein écran
          et que les feuilles de formulaire. Le logo clair y est lisible en permanence, alors
          qu'une barre transparente le faisait disparaître au-dessus des heros clairs des
          pages internes ; et la page ne « saute » plus au premier scroll, puisque le fond ne
          change pas.

          Sur GRAND ÉCRAN : le comportement d'origine — transparent au repos, blanc translucide
          une fois la page défilée — parce que le hero de l'accueil est sombre et que la barre y
          doit s'effacer. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          overHero
            ? "border-b border-transparent bg-transparent py-4 lg:py-6"
            : scrolled
              ? "border-b border-ink/10 bg-paper/90 py-2 backdrop-blur-xl"
              : "border-b border-ink/10 bg-paper/70 py-3 backdrop-blur-md lg:py-4"
        }`}
      >
        <div className="max-w-[91rem] mx-auto flex items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-0">
          <Link
            href={href("/")}
            aria-label={dict.site.name}
            className="relative z-10 flex items-center"
          >
            {/* Le nom de la maison, écrit — pas un logo emprunté à une autre activité. Sur
                téléphone la barre est toujours sur l'encre (texte clair) ; sur grand écran il
                suit l'état de la barre : clair au-dessus du hero, encre une fois collé. */}
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

          <nav
            className={`items-center gap-1 ${overHero ? "hidden" : "hidden lg:flex"}`}
            aria-label={dict.ui.navLabel}
          >
            {dict.nav.map((item) =>
              item.href === "/services" ? (
                /* L'entrée Services n'est plus un lien survolé : c'est le déclencheur du
                   panneau plein écran (même objet que la recherche — fond encre, logo, croix
                   cerclée, Échap, Tab contenu, page figée). La vue d'ensemble des services
                   vit DANS le panneau, en tête de sa liste. */
                <button
                  key={item.href}
                  ref={servicesTriggerRef}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={servicesPanel}
                  onClick={() => setServicesPanel(true)}
                  className={`flex items-center cursor-pointer gap-1 px-4 py-2 transition-colors ${
                    "text-ink/75 hover:text-brand"
                  }`}
                >
                  <span className="text-md font-light">{item.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      servicesPanel ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={href(item.href)}
                  className={`px-4 py-2 text-md font-light transition-colors ${
                    "text-ink/75 hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* La LANGUE reste dans le menu au-dessus du hero ; les deux actions de COMPTE,
                elles, restent dans la barre — c'est ce qu'on vient chercher, elles ne
                dépendent pas de l'endroit où l'on se trouve.

                Les deux suivent la convention du site : `freeQuote` (« Créer mon salon »)
                est l'action d'inscription partout ailleurs — accueil, pages de service — et
                mène donc à `/register` ; la connexion n'a qu'un mot, ajouté au dictionnaire.
                Sous `lg`, la barre n'a la place que pour le menu : les deux actions vivent
                alors dans le pied de la barre latérale. */}
            {!overHero && (
              <LocaleSwitch
                locale={locale}
                onChange={changeLocale}
                label={dict.ui.languageLabel}
              />
            )}

            <Link
              href={href("/login")}
              className={`hidden px-3 py-2 text-md font-light transition-colors lg:inline-block ${
                overHero ? "text-paper/80 hover:text-paper" : "text-ink/75 hover:text-brand"
              }`}
            >
              {dict.ui.login}
            </Link>

            <Link
              href={href("/register")}
              className={`hidden px-5 py-2.5 text-[0.64rem] font-medium uppercase tracking-[0.16em] transition-colors lg:inline-block ${
                overHero ? "bg-paper text-ink hover:bg-brand hover:text-paper" : "bg-ink text-paper hover:bg-brand"
              }`}
            >
              {dict.ui.freeQuote}
            </Link>

            <button
              ref={hamburgerRef}
              type="button"
              onClick={openMenu}
              aria-label={dict.ui.menuOpenLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`grid h-11 w-11 place-items-center transition-colors ${
                overHero
                  ? "text-paper hover:bg-paper/10"
                  : "text-ink hover:bg-ink/5 lg:hidden"
              }`}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Mega menu Services : PLEIN ÉCRAN — même `FullScreenPanel` que la feuille de
          formulaire (logo, croix cerclée, Échap, Tab contenu, page figée, panneau qui
          descend du haut puis cascade du contenu), mais sur une surface VERRE
          (`tone="glass"`) : encre translucide et flou d'arrière-plan, la page restant
          lisible en filigrane derrière le menu.

          MAIS c'est un MÉGA MENU, pas une page : la grille classique du genre — colonnes de
          liens à GAUCHE (titre + description par case, filets entre les cases, survol qui
          éclaire la case), et à DROITE le bloc IMAGE mis en avant — l'agenda du jour dessiné,
          celui de l'ancien bandeau survolé — qui n'est plus qu'une illustration depuis le
          retrait du bouton de devis. Au-dessus, la rangée de titre : l'étiquette,
          le grand libellé, et l'action « vue d'ensemble » à droite. */}
      {servicesPanel && (
        <FullScreenPanel
          label={dict.nav.find((n) => n.href === "/services")?.label ?? "Services"}
          closeLabel={dict.ui.menuCloseLabel}
          onClose={closeServicesPanel}
          returnFocusTo={servicesTriggerRef}
          /* Surface VERRE : encre translucide + flou d'arrière-plan — la page reste devinée
             derrière le menu, là où la recherche et le contact restent sur l'encre pleine. */
          tone="glass"
          footer={
            <>
              <span>{dict.ui.panelHint}</span>
              <a href={`mailto:${dict.site.email}`} className="transition-colors hover:text-paper">
                {dict.site.email}
              </a>
            </>
          }
        >
          {/* `data-lenis-prevent` : Lenis écoute la molette sur tout le document — sans
              cette marque, le menu ne défilerait pas à la molette. */}
          <div
            data-lenis-prevent
            className="container-x no-scrollbar flex min-h-0 flex-1 flex-col gap-9 overflow-y-auto overscroll-contain py-8 [justify-content:safe_center]"
          >
            {/* Rangée de titre : étiquette + libellé à gauche, vue d'ensemble à droite. */}
            <div data-panel-in className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <div>
                <span className={`${LABEL} text-paper/45`}>{dict.ui.ourOffer}</span>
                <h2 className="mt-4 font-light text-4xl leading-[1.05] tracking-tight text-paper sm:text-5xl">
                  {dict.nav.find((n) => n.href === "/services")?.label}
                </h2>
              </div>

              <TextLink href={href("/services")} tone="navy" strong>
                {dict.ui.viewAllServices}
              </TextLink>
            </div>

            {/* Les colonnes : le sommaire des services (deux colonnes de cases séparées
                par un filet, comme le tableau des clients) + le bloc image mis en avant. */}
            <div data-panel-in className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
              <ul className="grid content-start border-t border-paper/10 sm:grid-cols-2">
                {dict.services.map((s, i) => (
                  <li key={s.slug} className="border-b border-paper/10 sm:odd:border-r">
                    <Link
                      href={href(`/services/${s.slug}`)}
                      onClick={closeServicesPanel}
                      data-panel-autofocus={i === 0 ? "" : undefined}
                      className="group flex h-full flex-col gap-2 px-1 py-5 transition-colors duration-300 hover:bg-paper/[0.05] sm:px-5"
                    >
                      <span className="flex items-baseline gap-3">
                        <span
                          className={`${LABEL} shrink-0 tabular-nums text-paper/30 transition-colors duration-300 group-hover:text-brand`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-light text-xl leading-snug text-paper transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                          {s.title}
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 self-center text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      <span className="line-clamp-2 text-sm leading-relaxed text-paper/45">
                        {s.short}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Le panneau de droite du méga-menu : plus de photo de partenaires,
                  mais l'agenda du jour dessiné (`ProductPanel`). Le menu montre ce qu'on
                  vient chercher — la journée du salon — au lieu d'une image d'ambiance. */}
              <div className="relative hidden flex-col justify-between gap-6 bg-ink p-6 lg:flex">
                <div>
                  <span className={`${LABEL} text-turquoise`}>{dict.ui.expertise}</span>
                  <p className="mt-3 font-display text-2xl leading-tight text-paper">
                    {dict.ui.talkToUs}
                  </p>
                </div>

                <div className="text-ink">
                  <ProductPanel variant="agenda" />
                </div>

              </div>
            </div>
          </div>
        </FullScreenPanel>
      )}

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

            {/* Les deux actions de compte : c'est ici qu'elles vivent sur téléphone, et
                au-dessus du hero de l'accueil, où la barre ne garde que le nom et le menu. */}
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