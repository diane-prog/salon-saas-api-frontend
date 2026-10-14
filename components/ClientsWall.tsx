"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { ArrowUpRight } from "@/components/Icons";
import { clientLogos } from "@/lib/clients";

/**
 * Références clients (accueil) : un TABLEAU de logotypes, à la manière d'une page de
 * partenaires — le titre tient la marge de gauche, les logotypes occupent la droite, dans
 * des cases régulières séparées par un filet d'un pixel.
 *
 * C'est le dessin demandé, et il remplace le champ de tuiles flottantes qui tournait autour
 * du titre. Ce que ce tableau gagne : il tient sur un téléphone sans rien réorganiser (deux,
 * trois, puis quatre colonnes selon la place), chaque logotype occupe la même case optique
 * quelle que soit sa forme, et la lecture est immédiate — on voit d'un coup d'œil combien de
 * marques figurent au mur. Les animations du champ (dérive des tuiles, arcs qui se
 * retracent) disparaissent avec lui : ici, l'entrée de section est la seule animation, et
 * elle porte sur le tableau entier — les filets restent solidaires les uns des autres.
 *
 * La grille est complète : le tableau porte les filets du haut et de la gauche, chaque case
 * porte les siens en bas et à droite. Il n'y a donc aucune ligne à poser à part, et aucun
 * raccord à recoller (un filet par bord de case, jamais deux).
 *
 * Le CADRE autour : deux filets VERTICAUX qui tiennent la colonne de contenu, comme la
 * section services (`border-x` + même `max-w-[80rem]`) — ici en `navy/10`, le filet clair du
 * site, puisque la section est sur beige. Le tableau garde ses propres filets : le cadre est
 * en dehors de la marge, donc les deux ne se touchent jamais et rien n'est doublé.
 *
 * L'espace haut et bas est porté par le CADRE et non par la section : les filets montent
 * jusqu'au bord haut de la section (et descendent jusqu'au bord bas) au lieu de commencer
 * après une marge — c'est ce qui fait lire une grille, et non un bloc posé au milieu du
 * beige.
 */
export default function ClientsWall({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <section className="bg-beige/25">
      <div className="mx-auto w-full max-w-[80rem] border-x border-navy/10 px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-16">
          {/* Marge de gauche : titre et lien vers les réalisations — les projets des
              mêmes clients. Pas de sur-titre : c'est le tableau qui porte la
              démonstration. */}
          <Reveal className="max-w-sm">
            <h2 className="text-3xl leading-[1.08] text-navy sm:text-4xl lg:text-[2.6rem]">
              {title}
            </h2>
            <Link
              href={linkHref}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              {linkLabel}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <Reveal delay={90}>
            <ul className="grid grid-cols-3 border-t border-l border-navy/10 lg:grid-cols-4">
              {clientLogos.map((client) => (
                <li
                  key={client.src}
                  className="flex h-20 items-center justify-center border-r border-b border-navy/10 bg-white/45 px-3 sm:h-24 sm:px-5 lg:h-28"
                >
                  <Image
                    src={client.src}
                    alt={client.name}
                    width={client.width}
                    height={client.height}
                    /* Le logotype est calé sur une HAUTEUR (et non dans une boîte large et
                       basse) : les fichiers livrés vont du bandeau 256 × 105 au carré
                       196 × 196, et une boîte de largeur fixe écrasait les uns ou laissait
                       les autres minuscules. La couleur reste : c'est la marque du client,
                       pas une vignette à révéler au survol. */
                    className="h-6 w-auto max-w-full object-contain sm:h-7 lg:h-8"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
