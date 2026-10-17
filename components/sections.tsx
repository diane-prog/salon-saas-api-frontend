import type { ReactNode } from "react";

/**
 * Le hero des pages internes — typographique, sans photo.
 *
 * CE QUI A ÉTÉ RETIRÉ DE CE FICHIER, ET POURQUOI : il exportait aussi `KeywordMarquee`,
 * `StatsSection`, `TestimonialsSection`, `SplitShowcase` et `ArrowLink`. Aucun n'était plus
 * monté depuis la refonte (le compte se vérifie : un seul export de ce module est importé
 * ailleurs, `HeroSection`), et deux d'entre eux portaient encore du contenu de l'ancienne
 * agence — « Client Stories » comme titre de section, des témoignages de campagnes
 * publicitaires, un ruban de mots-clés de marque. Du code mort qui parle du mauvais métier
 * finit toujours par revenir : il est supprimé.
 *
 * Le hero lui-même portait une grande photo (`other-hero`) sous un dégradé clair, deux
 * voiles noirs et un titre bleu : trois effets empilés pour rendre lisible une image qui
 * n'avait rien à faire là. Ici, le sujet est le texte. Une étiquette de laiton, un filet, un
 * titre sérif très large, un chapô — et beaucoup d'air. C'est la même main que l'accueil : du
 * papier, de l'encre, un seul accent.
 *
 * La grille met l'étiquette dans la marge (3 colonnes) et le texte à droite (9) dès `lg` ;
 * sur téléphone les deux s'empilent, l'étiquette restant au-dessus. Aucune animation
 * d'entrée : le hero est ce qu'on voit en premier, il n'a pas à se mériter.
 */
export function HeroSection({
  eyebrow,
  title,
  highlight,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  /** Chapô sous le titre. Optionnel : certaines pages portent leur ouverture plus bas. */
  body?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative bg-paper pb-14 pt-32 text-ink sm:pb-20 sm:pt-40">
      <div className="container-x">
        <div className="grid gap-8 border-b border-ink/10 pb-12 lg:grid-cols-12 lg:gap-12 lg:pb-16">
          <div className="lg:col-span-3">
            <span className="text-[0.66rem] uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
            <span aria-hidden className="mt-4 block h-px w-12 bg-brand/60" />
          </div>

          <div className="lg:col-span-9">
            <h1 className="max-w-[22ch] font-display text-[clamp(2.5rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              {title}
              {highlight ? (
                <>
                  {" "}
                  <em className="text-brand">{highlight}</em>
                </>
              ) : null}
            </h1>

            {body && (
              <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-ink/60 sm:text-[1.1rem]">
                {body}
              </p>
            )}

            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
