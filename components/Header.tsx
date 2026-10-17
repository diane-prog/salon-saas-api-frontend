"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductPanel } from "@/components/ProductPanel";
import { usePathname } from "next/navigation";
import { Close, Menu, ChevronDown, ArrowRight } from "@/components/Icons";
import { switchLocalePath, type Locale } from "@/lib/dictionaries";
import { useDictionary } from "@/components/DictionaryProvider";
import HeaderSearch from "@/components/HeaderSearch";
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
  const [servicesOpen, setServicesOpen] = useState(false);
  /* Mega menu Services : un VRAI dialogue plein écran (même `FullScreenPanel` que la
     recherche), plus un panneau CSS survolé. L'état vit ici, avec le déclencheur qui
     reprend le focus à la fermeture. */
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
    /* Les panneaux du header se referment AVANT de partir. Changer de langue depuis le menu
       mobile laissait sinon le panneau par-dessus la page d'arrivée : l'écran restait couvert
       et il fallait actualiser. Ici, pas d'état à rattraper après coup — on referme à la
       source, dans le geste qui quitte la page. */
    setOpen(false);
    setServicesOpen(false);
    setServicesPanel(false);
    document.cookie = `belora-locale=${next};path=/;max-age=31536000;samesite=lax`;
    /* `hard: true` : navigation PLEINE PAGE sous le rideau, et non `router.push`. Un
       changement de langue remonte tout `app/[lang]` — donc le rideau lui-même. En doux,
       l'ancienne instance partait en laissant son rideau posé, et l'écran restait couvert
       sur l'ancienne langue jusqu'à actualisation. En pleine page, l'ancien document (rideau
       baissé inclus) est détruit avec la navigation : rien ne peut rester coincé. */
    navigate(switchLocalePath(next, pathname), next === "fr" ? "Français" : "English", {
      hard: true,
    });
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
        className={`fixed inset-x-0 top-0 z-50 border-b border-ink/10 transition-all duration-300 ${
          scrolled
            ? "bg-paper/90 py-2 backdrop-blur-xl"
            : "bg-paper/70 py-3 backdrop-blur-md lg:py-4"
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
                "text-ink"
              }`}
            >
              {dict.site.name}
            </span>

            <span
              className={`hidden font-display text-[1.45rem] leading-none tracking-[-0.015em] transition-colors lg:inline ${
                "text-ink"
              }`}
            >
              {dict.site.name}
              <span aria-hidden className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={dict.ui.navLabel}>
            {dict.nav.map((item) =>
              item.href === "/services" ? (
                /* L'entrée Services n'est plus un lien survolé : c'est le déclencheur du
                   panneau plein écran (même objet que la recherche — fond encre, logo, croix
                   cerclée, Échap, Tab contenu, page figée). La vue d'ensemble des services
                   et le devis vivent DANS le panneau, en tête de sa liste. */
                <button
                  key={item.href}
                  ref={servicesTriggerRef}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={servicesPanel}
                  onClick={() => setServicesPanel(true)}
                  className={`flex items-center cursor-pointer gap-1 rounded-full px-4 py-2 transition-colors ${
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
                  className={`rounded-full px-4 py-2 text-md font-light transition-colors ${
                    "text-ink/75 hover:text-brand"
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
              onChange={changeLocale}
              label={dict.ui.languageLabel}
            />

            <HeaderSearch />

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={dict.ui.menuOpenLabel}
              className="grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Mega menu Services : PLEIN ÉCRAN, comme la recherche — même `FullScreenPanel`
          (logo, croix cerclée, Échap, Tab contenu, page figée, panneau qui descend du haut
          puis cascade du contenu — le geste du rideau de transition), mais sur
          une surface VERRE (`tone="glass"`) : encre translucide et flou d'arrière-plan, la
          page restant lisible en filigrane derrière le menu.

          MAIS c'est un MÉGA MENU, pas une page : la grille classique du genre — colonnes de
          liens à GAUCHE (titre + description par case, filets entre les cases, survol qui
          éclaire la case), et à DROITE le bloc IMAGE mis en avant avec l'action y étant
          (le devis), celui de l'ancien bandeau survolé. Au-dessus, la rangée de titre : l'étiquette,
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

                <Link
                  href={href("/devis")}
                  onClick={closeServicesPanel}
                  className="group inline-flex w-fit items-center gap-2 border-b border-paper/30 pb-1 text-[0.7rem] uppercase tracking-[0.16em] text-paper/80 transition-colors hover:border-paper hover:text-paper"
                >
                  {dict.ui.freeQuote}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </FullScreenPanel>
      )}

      {open && (
        <div className="fixed inset-0 z-60 flex flex-col bg-ink text-paper grain lg:hidden">
          {/* Barre haute : le MÊME en-tête que les autres panneaux plein écran — logo clair,
              croix cerclée. Les trois surfaces du site (recherche, formulaire, menu) se
              ressemblent, on ne change pas de vocabulaire en changeant de panneau. */}
          <div className="container-x flex items-center justify-between py-4">
            <span className="font-display text-[1.4rem] leading-none tracking-[-0.015em] text-paper">
              {dict.site.name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.ui.menuCloseLabel}
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
            aria-label={dict.ui.menuNavLabel}
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
                onChange={changeLocale}
                label={dict.ui.languageLabel}
                size="lg"
              />
              <Link
                href={href("/devis")}
                onClick={() => setOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-brand to-turquoise px-6 py-4 text-sm font-light text-white"
              >
                {dict.ui.dock.quote}
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
  onChange,
  label,
  size = "sm",
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const labels = switchLabels[locale];
  /* La barre est claire en toutes circonstances (hero papier) : la pastille est donc
     encre sur papier, sans variante de défilement — une seule apparence, partout. */
  const base =
    "inline-flex items-center rounded-full p-0.5 text-[0.68rem] font-light transition-colors bg-ink/[0.06] text-ink/60";
  const tone = "";
  const active = "bg-ink text-paper";
  const pad = size === "lg" ? "py-2 px-1" : "py-1";

  return (
    <div className={`${base} ${tone} ${pad}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange("fr")}
        aria-current={locale === "fr" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "fr" ? active : "hover:text-ink"
        }`}
      >
        {labels.fr}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-current={locale === "en" ? "true" : undefined}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en" ? active : "hover:text-ink"
        }`}
      >
        {labels.en}
      </button>
    </div>
  );
}