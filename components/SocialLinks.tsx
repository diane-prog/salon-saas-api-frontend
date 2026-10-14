import { ArrowUpRight } from "@/components/Icons";
import { socialIcon, socialLinks } from "@/components/SocialIcons";
import type { Dictionary } from "@/lib/dictionaries";

/**
 * Les réseaux du site, en ligne : le LOGO officiel puis l'intitulé, chacun cliquable.
 *
 * Pourquoi les deux : le logo dit le réseau d'un coup d'œil et rend la ligne reconnaissable ;
 * l'intitulé reste lisible par un lecteur d'écran, indexable, et ne dépend pas de la mémoire
 * visuelle de la marque. Une icône seule obligerait à devinez, un mot seul ne se voit pas.
 *
 * Composant de SERVEUR (aucune interactivité) : les pages contact et devis l'affichent tel
 * quel, avec exactement les réseaux du dictionnaire — WhatsApp compris.
 */
export default function SocialLinks({
  site,
  className = "",
}: {
  site: Dictionary["site"];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-7 gap-y-3 ${className}`}>
      {socialLinks(site).map((social) => {
        const Icon = socialIcon(social.label);
        return (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm text-navy transition-colors duration-300 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {Icon && <Icon className="h-[1.05rem] w-[1.05rem] shrink-0 text-navy/70 group-hover:text-brand" />}
              {social.label}
              <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
