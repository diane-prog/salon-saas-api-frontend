import { socialIcon, socialLinks } from "@/components/SocialIcons";
import type { Dictionary } from "@/lib/dictionaries";

/**
 * Les réseaux du site — ICÔNES SEULES, et volontairement grandes.
 *
 * Pourquoi sans l'intitulé : sur les pages contact et devis, la ligne de réseaux est une
 * rangée d'actions, pas une liste à lire. Les logos officiels se reconnaissent d'un coup
 * d'œil, et le nom répété à côté d'eux n'ajoutait que du texte à une colonne qui en porte
 * déjà beaucoup.
 *
 * Ce qui est visible disparaît, ce qui est DIT reste : chaque lien garde son intitulé dans
 * `aria-label` et `title` — donc lu par un lecteur d'écran, survolable à la souris — et le
 * nom reste dans le HTML servi, à portée des moteurs de recherche. Une icône seule sans
 * intitulé du tout serait un lien muet.
 *
 * Composant de SERVEUR (aucune interactivité) : les pages contact et devis l'affichent tel
 * quel, avec exactement les réseaux du dictionnaire — WhatsApp compris.
 */

/** Taille des logos : nettement plus grands que le texte qui les accompagnait avant. */
const iconCls = "h-7 w-7 shrink-0";

export default function SocialLinks({
  site,
  className = "",
}: {
  site: Dictionary["site"];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-4 ${className}`}>
      {socialLinks(site).map((social) => {
        const Icon = socialIcon(social.label);
        return (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className="inline-flex items-center justify-center text-navy/60 transition-colors duration-300 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              {Icon ? (
                <Icon className={iconCls} />
              ) : (
                /* Repli : un réseau présent dans le dictionnaire mais sans logo dessiné
                   s'affiche quand même, en texte, au lieu de disparaître de la page. */
                <span className="text-sm">{social.label}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
