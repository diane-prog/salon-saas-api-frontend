"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL, ROW, RULE } from "@/lib/editorial";

/**
 * Index des services : une table éditoriale, une ligne par service.
 *
 * Numéro, titre, phrase, flèche — le tout séparé par des filets, sans carte, sans ombre,
 * sans pastille.
 *
 * La version précédente faisait suivre le curseur par une vignette photo, alimentée par
 * `service.image` : six captures de projets d'agence. Ce n'était pas le produit. L'aperçu
 * est supprimé — il ne reste que la ligne, qui se suffit — et le type `Service` n'a plus
 * de champ image. La démonstration du produit vit sur l'accueil (`SalonDemo`) et sur les
 * pages de service (`ProductPanel`), avec de vraies données ou un dessin assumé.
 */
export default function ServicesTable() {
  const { dict, locale } = useDictionary();
  const { services, ui } = dict;

  return (
    <>
      <ul className={`border-t ${RULE}`}>
        {services.map((service, i) => (
          <li key={service.slug} className={`border-b ${RULE}`}>
            <Link
              href={`/${locale}/services/${service.slug}`}
              className="group grid items-baseline gap-x-8 gap-y-2 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] lg:grid-cols-[3rem_minmax(0,0.9fr)_minmax(0,1.1fr)_2rem]"
            >
              <span className={`${LABEL} tabular-nums text-ink/35`}>0{i + 1}</span>
              <span className={`${ROW} transition-transform duration-500 group-hover:translate-x-1`}>
                {service.title}
              </span>
              <span className={`${BODY} text-ink/60`}>{service.short}</span>
              <span className="hidden justify-self-end lg:block">
                <ArrowRight className="h-4 w-4 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className={`mt-6 ${LABEL} text-ink/35`}>{ui.viewAllServices}</p>
    </>
  );
}
