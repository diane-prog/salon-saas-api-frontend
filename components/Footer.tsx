"use client";

import Link from "next/link";
import { socialIcon, socialLinks } from "@/components/SocialIcons";
import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL } from "@/lib/editorial";

/**
 * Réseaux retirés du PIED DE PAGE uniquement (2026-10-18).
 *
 * YouTube : la maison n'y publie pas. WhatsApp : c'est un numéro de contact, pas un
 * profil, et le pied de page porte déjà le téléphone — l'y répéter en pastille brouillait
 * la rangée. La page contact, elle, garde la liste complète (`socialLinks`) : c'est une
 * rangée d'actions, pas une signature de bas de page.
 */
const HIDDEN_IN_FOOTER = new Set(["YouTube", "WhatsApp"]);

export default function Footer() {
  const { dict, locale } = useDictionary();
  const href = (p: string) => `/${locale}${p === "/" ? "" : p}`;

  return (
    <footer className="relative bg-ink text-paper">
      <div className="container-x relative">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            {/* Le nom de la maison, écrit : le pied de page referme la page sur l'encre. */}
            <span className="font-display text-[2.1rem] leading-none tracking-[-0.02em] text-paper">
              {dict.site.name}
              <span aria-hidden className="ml-1.5 inline-block h-2 w-2 rounded-full bg-brand" />
            </span>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">{dict.site.tagline}</p>
            {/* Les VRAIS logos des réseaux : deux lettres dans une pastille ne disent pas de
                quel réseau il s'agit, une marque si. La liste vient du dictionnaire (plus
                WhatsApp, déduit du téléphone) et les tracés de `SocialIcons` ; le pied de
                page en retire deux — voir `HIDDEN_IN_FOOTER` ci-dessus. Ajouter un réseau ne
                touche donc qu'à ces endroits. */}
            <h3 className={`${LABEL} mt-10 text-paper/45`}>{dict.ui.socials}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks(dict.site)
                .filter((s) => !HIDDEN_IN_FOOTER.has(s.label))
                .map((s) => {
                  const Icon = socialIcon(s.label);
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="grid h-10 w-10 place-items-center text-paper/70 ring-1 ring-paper/15 transition-colors duration-300 hover:text-turquoise hover:ring-turquoise/40"
                    >
                      {Icon ? <Icon className="h-[1.1rem] w-[1.1rem]" /> : s.label.slice(0, 2)}
                    </a>
                  );
                })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className={`${LABEL} text-paper/45`}>
              {dict.ui.footerQuickLinks}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              {dict.nav.map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} className="text-paper/70 transition-colors hover:text-turquoise">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className={`${LABEL} text-paper/45`}>
              {dict.ui.footerService}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              {dict.services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={href(`/services/${s.slug}`)}
                    className="text-paper/70 transition-colors hover:text-turquoise"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className={`${LABEL} text-paper/45`}>
              {dict.ui.footerQuickLinks}
            </h3>
            <ul className="mt-5 grid gap-3 text-sm">
              <li>
                <a href={dict.site.phoneRaw} className="text-paper/70 transition-colors hover:text-turquoise">
                  {dict.site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${dict.site.email}`} className="text-paper/70 transition-colors hover:text-turquoise">
                  {dict.site.email}
                </a>
              </li>
              <li className="text-paper/60">{dict.site.address}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-paper/10 py-6 text-xs text-paper/40 sm:flex-row">
          <p>© 2026 {dict.site.name}</p>
          <p>{dict.site.address}</p>
        </div>
      </div>
    </footer>
  );
}