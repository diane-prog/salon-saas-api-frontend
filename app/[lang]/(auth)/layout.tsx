import Link from "next/link";
import { notFound } from "next/navigation";

import AuthLocaleSwitch from "./auth-locale-switch";
import { getDictionary, isLocale } from "@/lib/dictionaries";
import { LABEL } from "@/lib/editorial";

/**
 * Coquille des écrans d'accès — connexion, vérification du code, ouverture d'un salon.
 *
 * CE QUI A CHANGÉ, ET POURQUOI : l'ancienne coquille empilait un en-tête, une
 * zone `flex-1` centrée AVEC un `py-12` double et un pied de page, dans une
 * grille de hauteur minimale. Sur un écran de portable, l'addition dépassait la
 * fenêtre de quelques dizaines de pixels : la page « scrollait » pour rien, et
 * le bloc de formulaire n'était plus optiquement centré.
 *
 * Ici, sur grand écran, la colonne est exactement de la hauteur de la fenêtre
 * (`h-[100dvh]`, pas de défilement du document) et seule la zone centrale peut
 * défiler si le contenu est vraiment plus haut (ouverture d'un salon). Sur
 * téléphone, la page reprend un flux normal (`min-h-[100dvh]`) : le clavier
 * virtuel ne doit jamais enfermer l'utilisateur.
 *
 * La colonne encre reste un écran d'accès, pas une page de vente : trois
 * promesses, un lien vers la vitrine de démonstration, rien d'autre.
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { auth } = dict.ui;

  return (
    <div className="grid min-h-[100dvh] bg-paper text-ink lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
      {/* ——— Colonne formulaire. */}
      <div className="flex min-h-[100dvh] flex-col px-5 pb-8 pt-6 sm:px-10 lg:h-full lg:min-h-0 lg:px-16 lg:pb-10 lg:pt-8">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink/10 pb-5">
          <Link
            href={`/${lang}`}
            className="font-display text-xl leading-none tracking-[-0.01em] text-ink transition-colors hover:text-brand"
          >
            {dict.site.name}
          </Link>
          <AuthLocaleSwitch current={lang} />
        </header>

        <div className="flex flex-1 items-center justify-center py-10 lg:min-h-0 lg:overflow-y-auto">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>

        <footer className="shrink-0 border-t border-ink/10 pt-5">
          <Link
            href={`/${lang}`}
            className="text-[0.66rem] uppercase tracking-[0.14em] text-ink/40 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {auth.backToSite}
          </Link>
        </footer>
      </div>

      {/* ——— Colonne encre. Le grand « B » en filigrane donne l'échelle ; il
              n'est jamais lu par un lecteur d'écran. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink px-14 py-12 text-paper lg:flex xl:px-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 select-none font-display text-[26rem] leading-none text-paper/[0.035]"
        >
          B
        </span>

        <div className="relative">
          <span className={`${LABEL} text-paper/35`}>{dict.site.name}</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-[clamp(2rem,3vw,2.9rem)] leading-[1.06] tracking-[-0.01em]">
            {auth.panel.title}
          </p>

          <ul className="mt-10 grid gap-0">
            {auth.panel.points.map((point) => (
              <li key={point} className="border-t border-paper/10 py-4 last:border-b">
                <span className="block text-sm leading-relaxed text-paper/65">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/${lang}#demo`}
          className="relative inline-flex w-fit items-center border-b border-paper/25 pb-1 text-[0.66rem] uppercase tracking-[0.16em] text-paper/60 transition-colors hover:border-turquoise hover:text-turquoise"
        >
          {auth.panel.demo}
        </Link>
      </aside>
    </div>
  );
}
