import type { Dictionary } from "@/lib/dictionaries";
import { BODY, LABEL, RULE, SUB } from "@/lib/editorial";

/**
 * Questions fréquentes (accueil), posée juste après les forfaits : la section répond aux
 * cinq objections qui reviennent avant l'inscription, à l'endroit exact où elles surgissent.
 *
 * Composant SERVEUR et contenu statique : aucune ligne de JavaScript n'est livrée pour
 * l'ouvrir — `<details>` natif, donc utilisable au clavier, annoncé correctement par les
 * lecteurs d'écran, et lisible même sans CSS. Le `+` pivote de 45° à l'ouverture ; c'est la
 * seule animation.
 *
 * Ce même bloc alimente le JSON-LD `FAQPage` construit dans la page d'accueil : la page
 * visible et ce que les moteurs de lecture consomment viennent d'une seule source.
 */
export default function FaqSection({ faq }: { faq: Dictionary["faq"] }) {
  return (
    <section id="faq" className={`border-t bg-white ${RULE}`}>
      <div className="container-x grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <span className={`${LABEL} text-brand`}>{faq.eyebrow}</span>
          <h2 className="mt-4 font-light text-3xl leading-[1.12] tracking-tight text-ink sm:text-4xl">
            {faq.title}
          </h2>
          <p className={`mt-5 max-w-md ${BODY} text-ink/70`}>{faq.lead}</p>
        </div>

        <div className="lg:col-span-7">
          <div className="border-t border-ink/10">
            {faq.items.map((item) => (
              <details key={item.q} className="group border-b border-ink/10">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className={`${SUB} text-ink`}>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-lg leading-none text-ink/40 transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className={`pb-5 pr-8 ${BODY} text-ink/70`}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
