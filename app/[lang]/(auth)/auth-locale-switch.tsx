"use client";

import { usePathname } from "next/navigation";
import { localeNames, locales, switchLocalePath, type Locale } from "@/lib/dictionaries";

/**
 * Sélecteur de langue des écrans d'accès.
 *
 * Les écrans `(auth)` n'ont pas le header du site : ce commutateur est donc leur
 * seul moyen de changer de langue. Il fait exactement ce que fait celui du
 * header — cookie de préférence, puis navigation **pleine page** — et pour la
 * même raison : changer de langue remonte tout `app/[lang]`, donc en navigation
 * douce l'ancienne instance de page reste montée le temps d'un aller-retour.
 *
 * Il est écrit ici plutôt que partagé avec `Header` : la version du header
 * dépend du rideau de transition (`usePageTransition`), absent de cette surface.
 */
/**
 * Pose le cookie de langue, puis recharge sur la même page dans l'autre langue.
 *
 * L'écriture du cookie vit HORS du composant : elle touche un objet du
 * navigateur, pas l'état du rendu. Appelée depuis le gestionnaire de clic, elle
 * garde le même effet, sans faire croire au compilateur React qu'un composant
 * mute une valeur extérieure pendant son rendu.
 */
function changeLocale(next: Locale, pathname: string) {
  document.cookie = `belora-locale=${next};path=/;max-age=31536000;samesite=lax`;
  window.location.assign(switchLocalePath(next, pathname));
}

export default function AuthLocaleSwitch({ current }: { current: Locale }) {
  const pathname = usePathname();

  const change = (next: Locale) => changeLocale(next, pathname);

  return (
    <div
      className="flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]"
      aria-label="Langue"
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => change(locale)}
          aria-current={locale === current ? "true" : undefined}
          title={localeNames[locale]}
          className={`px-2.5 py-1 transition-colors ${
            locale === current ? "text-ink" : "text-ink/40 hover:text-ink"
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
