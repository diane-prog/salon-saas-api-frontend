"use client";

import Link from "next/link";

import AmbientVideo from "@/components/AmbientVideo";
import { useDictionary } from "@/components/DictionaryProvider";
import { BODY, LABEL } from "@/lib/editorial";
import { useSalonInfo, useSalonServices, useSalonStaff } from "@/features/public-salon/queries";

/**
 * Section « En direct » de l'accueil (`#demo`).
 *
 * LA COMPOSITION : deux moitiés, bord à bord. À GAUCHE, un média vertical (une IMAGE),
 * le texte à sa droite, puis les lignes de données ; à DROITE, un grand champ plein
 * cadre (la VIDÉO, muette et en boucle), à la couleur primaire du salon. Rien n'est
 * encadré, rien n'est arrondi : les filets d'un pixel et le blanc font tout le travail.
 *
 * CE QUE LA SECTION MONTRE : les données réelles du salon de démonstration, lues sur
 * l'API pendant que la page s'affiche — ses prestations, son équipe, l'état de sa
 * réservation. Le champ de droite prend la couleur de sa vitrine : la personnalisation
 * se voit sans qu'on ait à l'écrire.
 *
 * LES MÉDIAS sont livrés avec le dépôt (`public/media/demo.mp4`, `public/media/demo.jpg`),
 * et remplacés par les variables d'environnement quand elles sont posées :
 *   - `NEXT_PUBLIC_DEMO_IMAGE`  : l'image de la colonne de gauche (cadre 4:5) ;
 *   - `NEXT_PUBLIC_DEMO_VIDEO`  : la vidéo du grand champ de droite (mp4/webm). Lecture en
 *     boucle, sans son, sans commandes — un plan, pas un lecteur.
 * Sans aucun des deux, le cadre garde un champ dessiné (dégradé chaud + grain) : on ne pose
 * jamais une balise média vide, qui afficherait un rectangle noir.
 *
 * TROIS ÉTATS, dits franchement : chargement (un tiret, pas de valeur inventée), échec
 * (une phrase honnête, aucune valeur d'exemple), réponse (les vraies lignes).
 */
const SLUG = process.env.NEXT_PUBLIC_DEMO_SALON_SLUG ?? "";
const VIDEO = process.env.NEXT_PUBLIC_DEMO_VIDEO ?? "/media/demo.mp4";
const IMAGE = process.env.NEXT_PUBLIC_DEMO_IMAGE ?? "/media/demo.jpg";

/** Champ de repli : le dégradé chaud du site, jamais un rectangle noir. */
function FallbackField() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(150deg,#e8cda4_0%,#cfa271_42%,#96693e_78%,#5d422b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(58%_58%_at_68%_18%,rgba(255,242,216,0.8),transparent_72%)]" />
    </>
  );
}

export default function SalonDemo() {
  const { dict, locale } = useDictionary();
  const { demo } = dict.ui;

  const info = useSalonInfo(SLUG);
  const services = useSalonServices(SLUG);
  const staff = useSalonStaff(SLUG);

  const loading = [info, services, staff].some((query) => query.isPending);
  const failed = [info, services, staff].some((query) => query.isError);

  const salon = info.data?.data;
  const serviceList = services.data?.data ?? [];
  const teamList = staff.data?.data ?? [];

  /** Une ligne = une étiquette et sa valeur, lue sur l'API. */
  const rows = [
    {
      label: demo.servicesLabel,
      value: serviceList.map((service) => service.name).join(" · ") || demo.empty,
    },
    {
      label: demo.teamLabel,
      value: teamList.map((member) => member.firstName).join(" · ") || demo.empty,
    },
    {
      label: demo.bookingLabel,
      value: salon?.publicBooking ? demo.bookingOpen : demo.bookingClosed,
    },
  ];

  return (
    <section id="demo" className="bg-white text-ink">
      <div className="grid lg:grid-cols-2">
        {/* ———————————————— Moitié gauche : média, texte, données. */}
        <div className="flex flex-col px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-start sm:gap-8 lg:gap-10">
            {/* Le média vertical — l'IMAGE du salon, cadre 4:5. */}
            <div className="relative aspect-[4/5] overflow-hidden bg-ink/5 sm:col-start-1 sm:row-start-1">
              {IMAGE ? (
                // eslint-disable-next-line @next/next/no-img-element -- image fournie par l'exploitant (chemin local ou URL), hors liste blanche de `next/image`
                <img
                  src={IMAGE}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <FallbackField />
              )}
            </div>

            {/* Le texte : l'état du direct, le titre, la provenance, la sortie. */}
            <div className="sm:col-start-2 sm:row-start-1">
              <span className={`${LABEL} flex items-center gap-2 text-ink/45`}>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />{demo.eyebrow}
              </span>

              <h2 className="mt-5 font-display text-[clamp(1.6rem,2.6vw,2.15rem)] font-light leading-[1.08] tracking-[-0.02em]">
                {demo.title}
              </h2>

              <p className={`mt-4 text-ink/55 ${BODY}`}>
                {failed ? demo.unavailable : demo.body}
              </p>

              <Link
                href={`/${locale}/register`}
                className="group mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-[0.8rem] transition-colors hover:border-ink"
              >
                {demo.cta}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Les lignes de données : étiquette à gauche, valeur de l'API à droite. */}
          {!failed && (
            <dl className="mt-12 sm:mt-16 lg:mt-auto lg:pt-16">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-t border-ink/10 py-4 sm:grid-cols-[8rem_1fr] sm:gap-8"
                >
                  <dt className={`${LABEL} text-ink/35`}>{row.label}</dt>
                  <dd className="min-w-0 text-[0.88rem] leading-[1.6] text-ink/70">
                    {loading ? <span className="text-ink/25">—</span> : row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* ———————————————— Moitié droite : le champ plein cadre, aux couleurs du salon.
                          La vidéo d'ambiance si elle est fournie, sinon la couleur
                          primaire du salon et le grain — la personnalisation se voit.
                          Elle ne tourne que lorsqu'elle est à l'écran (`AmbientVideo`) :
                          la section est loin sous le pli, elle n'a rien à décoder
                          pendant qu'on lit le haut de page. */}
        <div
          className="relative min-h-[24rem] overflow-hidden lg:min-h-[38rem]"
          style={salon ? { background: salon.colors.primary } : undefined}
        >
          {VIDEO ? (
            <AmbientVideo
              src={VIDEO}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            !salon && <FallbackField />
          )}

          {/* Le grain dans son propre cadre : `grain` pose `position: relative`. */}
          <div className="absolute inset-0">
            <div className="grain h-full w-full" />
          </div>

          {salon && (
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-10">
              <span className={`${LABEL} text-white/70`}>{salon.name}</span>
              <span aria-hidden className="flex items-end gap-1">
                {[salon.colors.secondary, salon.colors.accent].map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    className="block w-1.5 rounded-full"
                    style={{ background: color, height: `${1.5 + index * 0.6}rem` }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
