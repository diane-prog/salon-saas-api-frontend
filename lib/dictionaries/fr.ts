export const site = {
  /* Nom et promesse du PRODUIT.

     ⚠️ Le bloc de coordonnées juste en dessous (téléphone, e-mail, adresse,
     réseaux sociaux) appartient encore à l'ancienne identité d'agence : il doit
     être remplacé par les coordonnées réelles de Belora, et elles ne peuvent pas
     être inventées. Tant qu'elles ne sont pas fournies, le pied de page et les
     données structurées annoncent un contact qui n'est pas le bon. */
  name: "Belora",
  tagline:
    "Le logiciel des salons : agenda, réservation en ligne, clients, caisse et équipe, au même endroit.",
  phone: "+221 78 122 93 05",
  phoneRaw: "tel:+221781229305",
  /* WhatsApp : une seule adresse dans tout le site (footer, éventail, assistant), déduite du
     numéro — pour qu'un changement de numéro ne se fasse qu'ici. */
  whatsapp: "https://wa.me/221781229305",
  /* Adresse de contact du produit. C'est un point à remplacer par la boîte réelle
     avant la mise en ligne. WhatsApp est déduit du numéro (`components/SocialIcons`). */
  email: "bonjour@belora.app",
  address: "Dakar, Sénégal",
  hours: "Lun-Ven, 9h-18h",
  /* ⚠️ LES HUIT `href` CI-DESSOUS SONT GÉNÉRIQUES, ET VOLONTAIREMENT : ils pointent vers
     la RACINE du réseau, sans identifiant de compte, parce que les comptes Belora ne sont
     pas connus ici et qu'une adresse devinée (`instagram.com/quelquun`) désignerait le
     compte d'un inconnu. Remplace chaque `href` par l'adresse réelle — un lien vers la
     racine d'Instagram ne mène nulle part d'utile — ou vide la liste pour que le pied de
     page ne montre que WhatsApp, qui vient du numéro ci-dessus. */
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
    { label: "X", href: "https://x.com/" },
    { label: "Pinterest", href: "https://www.pinterest.com/" },
    { label: "Threads", href: "https://www.threads.net/" },
  ] as { label: string; href: string }[],
};

/* Navigation : trois destinations et une ancre de métier. Les seuls href
   présents sont des routes RÉELLEMENT construites — jamais un lien mort.
   Le haut de page garde l'entrée `/services` : c'est elle qui ouvre le
   méga-menu (le Header s'appuie sur ce href précis). */
export const nav = [
  { label: "Accueil", href: "/" },
  { label: "Fonctionnalités", href: "/services" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", href: "/contact" },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  heroTitle: string;
  heroSubtitle: string;
  whyTitle: string;
  whyBody: string;
  offerings: string[];
  processLabel: string;
  processIntro: string;
  steps: { title: string; body: string }[];
  ctaTitle: string;
  ctaBody: string;
};

export const services: Service[] = [
  {
    slug: "agenda",
    title: "Agenda & rendez-vous",
    short:
      "La journée du salon d'un seul regard : créneaux occupés, disponibilités, statuts et reports.",
    heroTitle: "Agenda & rendez-vous",
    heroSubtitle: "La journée de votre salon, d'un seul regard",
    whyTitle: "Pourquoi un agenda ?",
    whyBody:
      "Un rendez-vous oublié, un créneau blanc, un client qui attend : la journée se joue là. Belora affiche qui fait quoi, où et pour combien de temps, fait passer chaque rendez-vous de réservé à honoré, et libère immédiatement les créneaux quand un report arrive. La réception n'a plus qu'à lire l'écran.",
    offerings: [
      "Vue jour, semaine et mois",
      "Créneaux occupés et disponibilités",
      "Report et annulation sans perte de donnée",
      "Statuts : en attente, confirmé, honoré, annulé, absent",
      "Notes visibles par toute l'équipe",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Du premier appel jusqu'à la sortie du client.",
    steps: [
      {
        title: "Prise",
        body: "Le client réserve en ligne, ou la réception prend le rendez-vous",
      },
      {
        title: "Confirmation",
        body: "Le statut suit l'échange, sans double saisie nulle part",
      },
      {
        title: "Jour J",
        body: "Le créneau passe de réservé à en cours, puis honoré",
      },
      {
        title: "Après",
        body: "Le rendez-vous nourrit la fiche client et les statistiques",
      },
    ],
    ctaTitle: "Votre agenda mérite mieux qu'un cahier.",
    ctaBody:
      "Ouvrez un salon, publiez vos prestations, et regardez les premières réservations arriver de toute seule.",
  },
  {
    slug: "reservation-en-ligne",
    title: "Réservation en ligne",
    short:
      "Une vitrine par salon, ouverte 24 h/24, avec vos prestations, votre équipe et vos vrais créneaux.",
    heroTitle: "Réservation en ligne",
    heroSubtitle: "Vos clients réservent pendant que vous travaillez",
    whyTitle: "Pourquoi accepter les réservations en ligne ?",
    whyBody:
      "Un rendez-vous pris à 23 h est un rendez-vous que vous n'aviez pas. Belora publie votre vitrine avec vos prestations, votre équipe et vos disponibilités réelles : le client choisit, l'agenda se remplit, et personne n'a décroché le téléphone. Chaque salon porte ses propres couleurs sur sa page.",
    offerings: [
      "Vitrine publique avec vos couleurs",
      "Parcours en quatre étapes : prestation, expert, créneau, coordonnées",
      "Créneaux réellement disponibles, jamais inventés",
      "Confirmation immédiate côté client",
      "Page dédiée à l'adresse de votre choix",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Quatre écrans, une minute, aucune application à installer.",
    steps: [
      { title: "Prestation", body: "Le client choisit ce dont il a besoin et voit le prix" },
      { title: "Expert", body: "Il choisit la personne, ou laisse le salon attribuer" },
      { title: "Créneau", body: "Seuls les horaires réellement libres sont proposés" },
      { title: "Coordonnées", body: "Nom, téléphone, confirmation : le rendez-vous est posé" },
    ],
    ctaTitle: "Donnez à votre salon une adresse qui travaille pour vous.",
    ctaBody:
      "Chaque salon reçoit sa vitrine, avec ses couleurs et ses horaires. Vous ne gérez qu'une chose : le calendrier.",
  },
  {
    slug: "fiches-clients",
    title: "Fiches clients",
    short:
      "Historique des visites, coordonnées, préférences et fidélité : la mémoire de votre salon.",
    heroTitle: "Fiches clients",
    heroSubtitle: "La mémoire de votre salon, à portée de main",
    whyTitle: "Pourquoi une fiche client ?",
    whyBody:
      "Retrouver la teinte, le forfait pris la dernière fois ou le stylo du client préféré en trois secondes, c'est ce qui fait revenir. Chaque client garde ses visites, ses habitudes et ce qui compte pour vous. Le même nom, la même personne, d'un rendez-vous à l'autre.",
    offerings: [
      "Fiche complète et recherche instantanée",
      "Historique de chaque visite",
      "Préférences et notes d'équipe",
      "Étiquettes et sources d'acquisition",
      "Suivi des passages et du montant dépensé",
    ],
    processLabel: "Comment ça marche",
    processIntro: "La fiche se remplit toute seule, au fil des rendez-vous.",
    steps: [
      { title: "Arrivée", body: "Première visite : nom, téléphone et provenance" },
      { title: "Suivi", body: "Chaque rendez-vous s'ajoute à l'historique" },
      { title: "Préférences", body: "L'équipe note ce qui compte pour ce client" },
      { title: "Retour", body: "Le client revient avec son historique déjà là" },
    ],
    ctaTitle: "Vos clients vous reviendront, et vous saurez pourquoi.",
    ctaBody: "Ouvrez votre espace et importez votre premier client en une minute.",
  },
  {
    slug: "prestations",
    title: "Prestations & tarifs",
    short:
      "Votre catalogue : durée, prix, catégorie, visibilité en ligne et ce que chacun rapporte.",
    heroTitle: "Prestations & tarifs",
    heroSubtitle: "Votre catalogue, tenu à jour",
    whyTitle: "Pourquoi un catalogue propre ?",
    whyBody:
      "Une prestation sans durée, c'est un créneau mal calculé ; un prix qui traîne, c'est une discussion à la caisse. Belora range vos prestations par catégorie, avec leur durée et leur tarif, et décide laquelle est réservable en ligne. Ce que vous affichez est ce que vos clients réservent.",
    offerings: [
      "Catégories et regroupements",
      "Durée et prix par prestation",
      "Visibilité en ligne, prestation par prestation",
      "Images et descriptions",
      "Disponibilité du catalogue en un coup d'œil",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Du catalogue à la caisse, une seule source de vérité.",
    steps: [
      { title: "Définition", body: "Nom, catégorie, durée et prix de chaque prestation" },
      { title: "Publication", body: "Vous choisissez ce qui est réservable en ligne" },
      { title: "Réservation", body: "Le client réserve la prestation au bon tarif" },
      { title: "Bilan", body: "Les prestations les plus demandées remontent dans les chiffres" },
    ],
    ctaTitle: "Votre catalogue, enfin lisible.",
    ctaBody: "Décrivez une prestation, donnez-lui une durée : elle est réservable tout de suite.",
  },
  {
    slug: "equipe",
    title: "Équipe & commissions",
    short:
      "Coiffeurs, praticiens, horaires, disponibilités et commissions : qui fait quoi, cette semaine.",
    heroTitle: "Équipe & commissions",
    heroSubtitle: "Qui fait quoi, et quand",
    whyTitle: "Pourquoi cadrer l'équipe ?",
    whyBody:
      "Les disponibilités se répartissent, les commissions se calculent, et personne ne doit se souvenir de rien. Belora garde les horaires de chaque membre, limite les réservations à ce qu'ils peuvent réellement absorber, et conserve ce qui revient à chacun.",
    offerings: [
      "Fiche de chaque membre",
      "Disponibilités hebdomadaires",
      "Spécialités et rôles",
      "Réservations limitées aux plages réelles",
      "Suivi des commissions",
    ],
    processLabel: "Comment ça marche",
    processIntro: "On publie une disponibilité, l'agenda respecte la règle.",
    steps: [
      { title: "Rôle", body: "Chaque membre a son poste et ses responsabilités" },
      { title: "Horaires", body: "Les plages de travail sont déposées une fois pour toutes" },
      { title: "Attribution", body: "Un rendez-vous tombe sur quelqu'un de réellement libre" },
      { title: "Fin de mois", body: "Les commissions sont calculées sur ce qui a été honoré" },
    ],
    ctaTitle: "Votre équipe est votre produit.",
    ctaBody: "Ajoutez vos experts, publiez leurs horaires, et laissez l'agenda faire le reste.",
  },
  {
    slug: "pilotage",
    title: "Pilotage & chiffres",
    short:
      "Vue du jour, chiffres du mois, abonnement, comptes et journal : la direction, pas l'impression.",
    heroTitle: "Pilotage & chiffres",
    heroSubtitle: "Savoir ce que fait votre salon, pas ce qu'il se raconte",
    whyTitle: "Pourquoi regarder les chiffres ?",
    whyBody:
      "Le chiffre d'affaires du mois, les prestations les plus demandées, l'absentéisme, l'état de votre abonnement : une décision prise sur une impression coûte cher. Belora regroupe la vue du jour, les statistiques et le journal des actions au même endroit, pour que la question soit tranchée par la donnée.",
    offerings: [
      "Vue du jour : rendez-vous, clients, alertes",
      "Statistiques et revenus du mois",
      "Répartition des rendez-vous par prestation",
      "Suivi de l'abonnement et de ses limites",
      "Comptes d'accès et journal des actions",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Une page par décision, et toujours la donnée à l'appui.",
    steps: [
      { title: "Mesure", body: "Tout rendez-vous honoré alimente les compteurs" },
      { title: "Lecture", body: "Le mois se compare au précédent, sans tableur" },
      { title: "Décision", body: "Vous voyez où ajuster : horaires, offre, équipe" },
      { title: "Traçabilité", body: "Qui a modifié quoi, et quand, reste consultable" },
    ],
    ctaTitle: "Décidez sur des chiffres, pas sur des impressions.",
    ctaBody: "Votre tableau de bord s'alimente dès le premier rendez-vous enregistré.",
  },
];

export const hero = {
  keywords: ["Agenda", "Réservation", "Clients", "Prestations", "Équipe", "Pilotage"],
  /* Le titre du hero est coupé en DEUX morceaux : `leadStatic` ne bouge pas, la
     seconde ligne porte l'italique de la maison (voir components/HomeHero.tsx).
     `lead` reste la phrase entière — c'est elle que lisent les lecteurs d'écran,
     les moteurs de recherche et les aperçus de partage. */
  lead: "Votre salon, sans le chaos.",
  leadStatic: "Votre salon,",
  leadRotating: ["sans le chaos.", "au bon rythme.", "sous contrôle."],
  body: "L'agenda, la réservation en ligne, les fiches clientes, la caisse et votre équipe dans un seul geste. Les clientes réservent à toute heure, vous voyez la journée d'un coup d'œil, et chaque créneau rapporte ce qu'il doit rapporter.",
  /* Le hero est une affiche : la phrase de droite reste courte, et les trois lignes de
     capitales de gauche nomment le produit au lieu de le vanter. */
  aside:
    "L'agenda, la réservation en ligne et les fiches clientes du salon, au même endroit — y compris quand le salon est fermé.",
  manifesto: ["Agenda & réservation", "Clientes, prestations, équipe", "Le salon tenu d'une main"],
  liveLabel: "Démonstration en direct",
  reassurances: [
    { value: "24 h/24", label: "Réservation en ligne" },
    { value: "1 seul", label: "Carnet de rendez-vous" },
    { value: "0", label: "Double saisie" },
  ],
  previewLabel: "Aperçu du produit",
  previewDay: "Aujourd'hui",
  previewRows: [
    { time: "09:30", service: "Coupe et brushing", staff: "Awa", status: "Confirmé" },
    { time: "11:00", service: "Couleur complète", staff: "Fatou", status: "En cours" },
    { time: "14:15", service: "Barbe et contours", staff: "Moussa", status: "Confirmé" },
    { time: "16:00", service: "Soin profond", staff: "Awa", status: "En attente" },
  ],
  previewTotal: "Recette prévue",
  previewBooking: "Réservation en ligne",
  previewBookingBody: "Une cliente vient de réserver à 21 h 47, pour demain à 10 h.",
  ticker: ["Agenda", "Réservation en ligne", "Fiches clientes", "Prestations", "Équipe", "Caisse"],
};

export const about = {
  title: "À propos",
  heading: "Le logiciel des salons qui travaillent",
  body: "Belora est né d'un constat simple : un salon n'a pas besoin d'un logiciel de plus, il a besoin que sa journée tienne debout. Nous réunissons l'agenda, la réservation en ligne, les fiches clientes, la caisse et l'équipe dans un seul outil, conçu pour être tenu d'une main pendant qu'on coiffe de l'autre.",
  points: [
    "Un seul carnet de rendez-vous, pour tout le salon",
    "Une vitrine publique à vos couleurs, ouverte 24 h/24",
    "Chaque créneau calculé : durée, prix, commission",
    "Une équipe joignable, qui répond en français",
  ],
};

/**
 * Réalisations. Chaque projet porte trois niveaux de lecture : `body` (une ligne, pour la
 * vignette et la recherche), puis `summary` + `scope` (le récit et le périmètre), affichés
 *
 * Ce qui est écrit là est DÉDUIT du projet, jamais inventé : le `client` vient du titre ou
 * du corps, le reste reformule le travail déjà décrit. Aucune date, aucun chiffre, aucun
 * résultat chiffré n'a été ajouté — une fiche qui invente une donnée est pire qu'une fiche
 * courte. Si un chiffre doit y figurer un jour, il vient du client, pas de nous.
 */
/**
 * Exemples de réalisations — **volontairement vides**.
 *
 * Cette liste portait six études de cas d'agence (identité d'événement, maquettes
 * publicitaires, refonte de site). C'étaient de vrais projets, mais ce ne sont pas
 * ceux d'un logiciel de salon : les afficher reviendrait à vendre autre chose que le
 * produit. La preuve est désormais la page elle-même, alimentée par l'API réelle du
 * salon de démonstration (voir `components/ProductShowcase.tsx`).
 *
 * Le tableau et son type restent : le jour où un client accepte d'être cité, il
 * suffit d'ajouter une entrée ici, sans toucher aux composants.
 */
export type ShowcaseProject = {
  title: string;
  body: string;
  category: string;
  image: string;
  client: string;
  summary: string;
  scope: string[];
};

export const projects: ShowcaseProject[] = [];

export const filters: string[] = [];

/**
 * Témoignages de l'ACCUEIL — les citations affichées par `components/Testimonials.tsx`.
 *
 * ⚠️ CES SIX CITATIONS SONT DES EXEMPLES RÉDIGÉS POUR LA MISE EN PAGE, pas des paroles
 * recueillies : elles occupent le rail tant que les vraies ne sont pas fournies. Elles
 * doivent être remplacées — ou validées, une par une, par la personne citée — avant toute
 * campagne ou tout argumentaire public. Une citation inventée n'est pas une maquette :
 * c'est un faux témoignage le jour où elle est publiée.
 *
 * Forme d'une entrée :
 *
 *   { name: "Awa Diop", role: "Gérante", company: "Salon Awa, Dakar",
 *     quote: "La phrase exacte, telle qu'elle a été dite.", image: "/temoignages/awa.jpg" }
 *
 * `image` est le chemin d'une photo (dans `public/`) ou une URL absolue. Vide (`""`), la
 * case affiche un aplat chaud à la place du portrait — jamais un visage fabriqué.
 *
 * Les six visuels de `public/temoignages/` sont des CHAMPS DESSINÉS (dégradé chaud + grain,
 * voir `scripts/make-testimonials.py`), pas des portraits : personne n'a encore fourni sa
 * photo. Le jour où c'est le cas, on dépose le fichier sous le nom attendu et on change
 * le chemin ici — aucun autre code à toucher.
 *
 * Sans entrée, la section n'est pas rendue du tout : pas de bandeau sans personne dedans.
 */
export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Awa Diop",
    role: "Gérante",
    company: "Salon Awa, Dakar",
    quote:
      "Avant, je notais les rendez-vous dans deux cahiers. Maintenant je regarde l'écran le matin et je sais qui vient, à quelle heure, et avec qui.",
    image: "/temoignages/01.jpg",
  },
  {
    name: "Fatou Ndiaye",
    role: "Coiffeuse",
    company: "Studio Kayao, Dakar",
    quote:
      "La réservation en ligne a rempli mes trous. Elle prend les rendez-vous le dimanche et à onze heures du soir, quand moi, je ne décroche plus.",
    image: "/temoignages/02.jpg",
  },
  {
    name: "Moussa Traoré",
    role: "Barbier",
    company: "Maison Traoré, Thiès",
    quote:
      "Je pose les horaires de mon équipe une fois, et la réservation ne propose plus que ce que mes barbiers peuvent vraiment prendre.",
    image: "/temoignages/03.jpg",
  },
  {
    name: "Aïcha Sow",
    role: "Responsable",
    company: "Institut Ndar, Saint-Louis",
    quote:
      "La fiche cliente me rend trois secondes : la teinte, la dernière prestation, ce qu'elle n'aime pas. Je ne redemande plus rien devant le miroir.",
    image: "/temoignages/04.jpg",
  },
  {
    name: "Nadia Bensalem",
    role: "Gérante",
    company: "Salon Lys, Casablanca",
    quote:
      "Je clôture le mois avec des chiffres, pas avec une impression. Les commissions de l'équipe sortent des rendez-vous honorés, sans tableur.",
    image: "/temoignages/05.jpg",
  },
  {
    name: "Léa Mercier",
    role: "Fondatrice",
    company: "Atelier Léa, Lyon",
    quote:
      "Ce qui m'a décidée, c'est la mise en route : mes prestations, mon équipe et mes horaires repris en une après-midi, et des rendez-vous dès le lendemain.",
    image: "/temoignages/06.jpg",
  },
];

export const aboutPage = {
  /* Titre du hero, repris mot pour mot du site de référence ; « Qui sommes-nous ? »
     (`title`) reste le titre du premier bloc de contenu, comme là-bas. */
  heroHeadline: "Le logiciel qui tient la journée d'un salon.",
  title: "Qui sommes-nous ?",
  lead: "Belora est un logiciel de gestion pour salons et instituts : l'agenda, la réservation en ligne, les fiches clientes, la caisse et l'équipe, réunis dans un seul outil.",
  body: "Nous le construisons avec des salonniers, sur leurs vrais journées : un geste, une information, aucun aller-retour entre deux outils.",
  pillarsTitle: "Nos fondations",
  pillars: [
    { title: "Le métier d'abord", body: "Chaque écran part d'un geste réel du salon, pas d'une liste de fonctionnalités." },
    { title: "Une seule source", body: "Un rendez-vous saisi une fois alimente le calendrier, la caisse, la fiche cliente et les statistiques." },
    { title: "Tenir dans la durée", body: "Vos données restent les vôtres, exportables, et le service ne s'arrête pas avec un forfait." },
  ],
  whyEyebrow: "Pourquoi Belora",
  whyHeadline: "Ce que change Belora",
  /* Une carte par raison : la grille de l'accueil affiche ces TROIS entrées numérotées
     (01 → 03), la quatrième case étant l'illustration. Trois titres courts, trois
     phrases : c'est la composition de la référence, pas un argumentaire. */
  whyCards: [
    {
      title: "Un agenda qui se remplit seul",
      body: "Les clientes réservent la nuit, le week-end, pendant que vous coiffez : la vitrine ne ferme jamais.",
    },
    {
      title: "Tout au même endroit",
      body: "Rendez-vous, clientèle, prestations, caisse et équipe partagent une seule source. Plus de double saisie.",
    },
    {
      title: "Des créneaux réels",
      body: "Les horaires proposés en ligne sont ceux que votre équipe peut absorber — jamais inventés.",
    },
  ],
  mission: {
    title: "Notre mission",
    body: "Rendre leur journée aux salons. Un salon qui n'a plus à recopier un rendez-vous trois fois, ni à rappeler une cliente pour confirmer, a du temps pour ce qu'il sait faire.",
  },
  vision: {
    title: "Notre vision",
    body: "Que chaque salon, du fauteuil unique à l'institut de dix personnes, ait l'outillage d'une grande maison : une vitrine qui prend les réservations à toute heure, et des chiffres qui disent la vérité.",
  },
  productTitle: "Le produit, montré plutôt que raconté.",
  productBody:
    "Ce panneau est l'écran de pilotage d'un salon : les rendez-vous du mois, la recette, le taux de retour. Chaque chiffre sort d'un rendez-vous réel — jamais d'une estimation.",
  valuesTitle: "Nos valeurs",
  values: [
    {
      title: "Le terrain décide",
      body: "Une fonctionnalité qui ne fait pas gagner un geste à la réception n'entre pas dans le produit.",
    },
    {
      title: "Peu, mais juste",
      body: "Chaque écran montre ce qu'il faut pour agir, et rien de plus. Pas de tableau de bord décoratif.",
    },
    {
      title: "La vérité des chiffres",
      body: "Une recette affichée est une recette encaissée. Quand une donnée manque, l'écran écrit « — », il ne l'invente pas.",
    },
    {
      title: "Vos données restent à vous",
      body: "Elles s'exportent, elles ne servent pas à autre chose, et partir ne demande pas de lettre recommandée.",
    },
  ],
  why: {
    title: "Pourquoi Belora ?",
    items: [
      {
        title: "Fait avec des salons",
        body: "Les écrans sont dessinés sur de vraies journées de salon, pas dans un bureau.",
      },
      {
        title: "Un seul outil",
        body: "Agenda, réservation, clientèle, caisse et équipe partagent la même source : rien à recopier.",
      },
      {
        title: "Sans engagement",
        body: "Quatorze jours d'essai, un mois à la fois, et vos données exportables à tout moment.",
      },
    ],
  },
};

export const servicesPage = {
  title: "Nos fonctionnalités",
  lead: "Six façons de tenir votre salon : réservez, accueillez, encaissez, pilotez. Chacune est un écran du produit, pas une promesse de brochure.",
};

export const contactPage = {
  title: "Contact",
  lead: "Une question sur Belora, un salon à ouvrir, une migration en vue ? Écrivez-nous, la réponse vient vite.",
  /* Blocs de coordonnées de la colonne de droite : un libellé discret au-dessus, la
     valeur en gras (e-mail et téléphone cliquables). */
  info: [
    { label: "Email", value: "bonjour@belora.app", href: "mailto:bonjour@belora.app" },
    { label: "Téléphone", value: "221 78 122 93 05", href: "tel:+221781229305" },
    { label: "Adresse", value: "Dakar, Sénégal", href: null },
    { label: "Horaires", value: "Lun-Ven, 9h-18h", href: null },
  ],
  /* La page ne porte pas de formulaire : les deux actions ci-dessous ouvrent le
     courriel ou le téléphone, et les coordonnées sont le contenu. C'est le seul
     point de contact du site depuis le retrait de la barre d'actions flottante
     (2026-10-17).
     Titre de la colonne de gauche : volontairement différent du titre de la page
     (« Contact »), que le hero affiche déjà. */
  heading: "Parlons de votre salon",
  actions: {
    email: "Écrire un e-mail",
    call: "Appeler",
  },
  note: "Une réponse sous 24 h ouvrées, du lundi au vendredi.",
  /* Le déroulé d'un premier échange, sous la fiche. */
  processTitle: "Comment ça se passe",
  process: [
    {
      title: "Vous écrivez",
      body: "Un e-mail suffit : votre salon, la taille de l'équipe, et la question qui vous occupe.",
    },
    {
      title: "Nous répondons",
      body: "Sous 24 h ouvrées, avec une réponse précise ou une proposition de créneau.",
    },
    {
      title: "On avance",
      body: "Démo sur vos vraies prestations, reprise de votre agenda, ou ouverture d'un espace.",
    },
  ],
  /* Contenu du panneau latéral (Sheet). */
  form: {
    title: "Écrivez-nous",
    body: "Remplissez le formulaire ci-dessous et nous vous répondrons dans les meilleurs délais.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    subject: "Sujet",
    message: "Message",
    jsNote: "Veuillez activer JavaScript dans votre navigateur pour remplir ce formulaire.",
    submit: "Envoyer le message",
    successTitle: "Message envoyé",
    successBody: "Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.",
  },
};

export const finalCta = {
  title: "Ouvrez votre salon aujourd'hui.",
  body: "L'espace est prêt en deux minutes. Vos premières réservations en ligne peuvent arriver dès demain.",
  primary: "Ouvrir un salon",
  secondary: "Nous contacter",
};

/**
 * Mur de logos — **volontairement vide**.
 *
 * Il listait les logos de clients d'une agence de communication. Les présenter comme
 * des salons utilisateurs du logiciel serait faux ; on n'affiche donc rien tant que
 * de vrais salons n'ont pas donné leur accord.
 */
export type ClientLogo = { name: string; src: string; width: number; height: number };

export const clients: ClientLogo[] = [];

/* Page « Le produit en vrai » (ancienne adresse /realisations) : tout ce qui est écrit
   ici décrit des données LUES sur l'API du salon de démonstration, jamais des exemples. */
export const showcase = {
  eyebrow: "Le produit en vrai",
  title: "Pas une maquette : un salon qui tourne.",
  lead: "Cette page interroge l'API du salon de démonstration pendant que vous la lisez. Prestations, équipe, photos, avis : ce sont ses vraies données, pas des valeurs d'exemple.",
  demoLabel: "Salon de démonstration",
  demoPlace: "Dakar, Sénégal",
  openSalon: "Ouvrir la vitrine",
  servicesTitle: "Ses prestations, telles qu'on les réserve.",
  servicesBody:
    "Nom, catégorie, durée, prix : la vitrine affiche exactement ces lignes, et ne propose que les créneaux réellement libres.",
  teamTitle: "L'équipe, et qui fait quoi.",
  teamBody:
    "Chaque membre porte ses spécialités. La cliente choisit sa personne, ou laisse le salon attribuer.",
  galleryTitle: "Ses photos, publiées depuis l'espace salon.",
  galleryBody:
    "C'est le même écran Galerie que dans l'espace : ce qui est publié ici est ce qui s'affiche sur la vitrine.",
  reviewsTitle: "Ce que les clientes en disent.",
  reviewsBody:
    "Note moyenne et commentaires publiés, servis par l'API. Aucun avis n'est écrit à la main.",
  unavailable: "Les données du salon de démonstration ne sont pas disponibles pour le moment.",
  empty: "Rien à afficher pour l'instant.",
};

export const ui = {
  /* Retour d'action : deux phrases lues par les notifications d'écriture
     (voir `lib/feedback.ts`) qui vivent hors de l'arbre React. */
  feedback: {
    success: "C'est enregistré.",
    error: "L'enregistrement n'a pas abouti. Réessayez dans un instant.",
  },
  viewAllProjects: "Voir le produit en vrai",
  viewAllServices: "Voir toutes les fonctionnalités",
  discussProject: "Parlons de votre salon",
  presentation: "Présentation",
  ourOffer: "Notre offre",
  portfolio: "Produit",
  methodology: "Méthode",
  expertise: "Fonctionnalité",
  agency: "Logiciel de gestion pour salons et instituts",
  freeQuote: "Créer mon salon",
  /* Connexion : le seul mot de la barre, avec `freeQuote`. Le reste du vocabulaire d'accès
     vit dans `auth` (titres, corps de page, aides) — ici, c'est le libellé d'un bouton. */
  login: "Connexion",
  talkToUs: "Parlons-nous",
  whatDrivesUs: "Ce qui nous anime",
  footerQuickLinks: "Liens rapide",
  footerService: "Service",
  socials: "Nos réseaux",
  rights: "Tous droits réservés.",
  notFoundTitle: "Oups ! Cette page est introuvable.",
  notFoundBody: "On dirait que rien n'a été trouvé à cet endroit. Retournez à l'accueil pour poursuivre votre navigation.",
  backHome: "Retour à l'accueil",
  languageLabel: "Langue",
  /* Repères de navigation : jamais visibles, ils nomment les régions et les boutons pour les
     lecteurs d'écran. Ils vivent ici, avec les autres libellés, parce qu'ils changent avec
     la langue doublée — écrits en dur, ils restaient français sur le site anglais. */
  navLabel: "Navigation principale",
  menuOpenLabel: "Ouvrir le menu",
  menuCloseLabel: "Fermer le menu",
  menuNavLabel: "Navigation mobile",
  formCloseLabel: "Fermer le formulaire",
  otherServices: "Autres services",
  /* Libellés historiques de la galerie de projets. `viewAllProjects` est encore lu par les
     pages de fonctionnalité ; le reste n'a plus de consommateur depuis la suppression de
     `ProjectsGallery` et `ProjectModal` (contenu d'agence).
     nomme le dialogue pour les lecteurs d'écran, les autres sont visibles. */
  servicesTitle: "Fonctionnalités",
  servicesBody:
    "Six briques, une seule source de données : l'agenda, la réservation en ligne, les fiches clients, les prestations, l'équipe et le pilotage. Rien ne se resaisit deux fois.",
  /* Rappel de clavier en pied de panneau plein écran (formulaire de contact, menu des
     fonctionnalités). */
  panelHint: "Échap pour fermer",
  /* Assistant conversationnel : libellés de la fenêtre de discussion. */
  chat: {
    title: "Assistant Belora",
    subtitle: "Une réponse immédiate sur le produit",
    placeholder: "Posez votre question…",
    send: "Envoyer",
    greeting:
      "Bonjour 👋 Je suis l'assistant Belora. Demandez-moi comment fonctionnent l'agenda, la réservation en ligne ou les forfaits.",
    suggestions: [
      "Comment marche la réservation en ligne ?",
      "Que fait l'agenda du salon ?",
      "Combien coûte Belora ?",
    ],
    error: "L'assistant est momentanément indisponible. Écrivez-nous à",
    close: "Fermer l'assistant",
  },
  /* Écrans d'accès (`app/[lang]/(auth)`).

     Le vocabulaire est celui d'un logiciel, pas d'une agence : on n'« entre pas en
     contact », on ouvre un espace. Les libellés des champs sont ici, partagés par
     les trois écrans, pour qu'un champ ne s'appelle jamais autrement d'une page à
     l'autre. */
  auth: {
    backToSite: "Retour au site",
    loading: "Un instant…",
    fields: {
      email: "E-mail",
      password: "Mot de passe",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Téléphone",
    },
    passwordHint: "8 caractères minimum, une lettre et un chiffre.",
    /* Messages de validation des formulaires d'accès. Ils vivent ICI parce qu'ils s'affichent
       à l'écran : écrits dans `features/auth/schemas.ts`, ils restaient français sur le site
       anglais. Les règles, elles, ne bougent pas — seule leur phrase change de langue. */
    validation: {
      tenantNameMin: "Le nom du salon fait au moins 2 caractères.",
      tenantNameMax: "Le nom du salon est trop long.",
      slugFormat: "Adresse attendue : minuscules, chiffres et tirets.",
      firstNameMin: "Le prénom fait au moins 2 caractères.",
      lastNameMin: "Le nom fait au moins 2 caractères.",
      email: "Adresse e-mail invalide.",
      passwordMin: "Le mot de passe fait au moins 8 caractères.",
      passwordLetter: "Le mot de passe contient au moins une lettre.",
      passwordDigit: "Le mot de passe contient au moins un chiffre.",
      code: "Le code fait exactement 6 chiffres.",
    },
    login: {
      eyebrow: "Espace salon",
      title: "Votre salon vous attend",
      body: "Entrez votre e-mail et votre mot de passe : nous vous envoyons un code à 6 chiffres pour confirmer que c'est bien vous.",
      submit: "Recevoir mon code",
      noAccount: "Vous n'avez pas encore de salon ?",
      createAccount: "Ouvrir un salon",
      error: "La connexion a échoué. Vérifiez vos identifiants et réessayez.",
    },
    otp: {
      eyebrow: "Vérification",
      title: "Entrez le code reçu",
      body: "Un code à 6 chiffres vient d'être envoyé à",
      code: "Code à 6 chiffres",
      submit: "Ouvrir mon espace",
      resend: "Renvoyer un code",
      resendIn: "Nouveau code dans",
      seconds: "s",
      sent: "Un nouveau code vient d'être envoyé.",
      changeEmail: "Utiliser une autre adresse",
      error: "Code refusé ou expiré. Demandez-en un nouveau.",
      missingEmail: "Adresse manquante : reprenez la connexion.",
      backToLogin: "Revenir à la connexion",
    },
    register: {
      eyebrow: "Nouveau salon",
      title: "Ouvrez votre salon en deux minutes",
      body: "Votre espace est créé immédiatement. Un code vous est ensuite envoyé pour confirmer votre adresse.",
      salonTitle: "Votre salon",
      accountTitle: "Votre compte",
      tenantName: "Nom du salon",
      tenantSlug: "Adresse de votre vitrine",
      slugHint: "Votre page publique, réservable en ligne. Modifiable à tout moment.",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Téléphone",
      submit: "Créer mon salon",
      /* Parcours en trois étapes. Les noms du rail sont volontairement courts : à trois
         colonnes, ils doivent tenir sur une ligne — même sur téléphone. */
      steps: {
        salon: "Le salon",
        account: "Le compte",
        security: "La sécurité",
      },
      next: "Continuer",
      back: "Retour",
      reviewTitle: "Vérifiez vos informations",
      edit: "Modifier",
      haveAccount: "Vous avez déjà un salon ?",
      signIn: "Se connecter",
      error: "La création a échoué. Vérifiez vos informations ou réessayez.",
      terms: "En créant votre salon, vous acceptez nos conditions d'utilisation.",
    },
    /* Colonne de droite, sur l'encre : trois affirmations courtes, jamais un
       argumentaire — l'écran d'accès n'est pas une page de vente. */
    panel: {
      title: "Votre agenda, vos clients et votre caisse, au même endroit.",
      points: [
        "Réservation en ligne, 24 h/24",
        "Fiche client et historique des visites",
        "Caisse, équipe et chiffres du jour",
      ],
      demo: "Voir une vitrine de démonstration",
    },
  },

  /* Espace salon (`app/[lang]/(app)`).

     Tous les libellés de la navigation sont écrits ici, y compris ceux dont
     l'écran n'existe pas encore : le jour où une route s'ouvre, il n'y a qu'une
     ligne à ajouter dans la coquille, sans retoucher la copie.

     Les intitulés sont ceux du métier, pas ceux de l'API : un salon dit « Prestations »
     là où le backend dit `salon-services`, et « Équipe » là où il dit `staff`. */
  dashboard: {
    brand: "Espace salon",
    logout: "Se déconnecter",
    viewSite: "Voir le site",
    nav: {
      overview: "Vue du jour",
      appointments: "Rendez-vous",
      calendar: "Agenda",
      customers: "Clients",
      services: "Prestations",
      staff: "Équipe",
      gallery: "Galerie",
      reviews: "Avis",
      messages: "Messages",
      notifications: "Notifications",
      analytics: "Statistiques",
      billing: "Abonnement",
      team: "Comptes & accès",
      audit: "Journal",
      settings: "Réglages",
    },
    groups: {
      day: "Le jour",
      clients: "Les clientes",
      salon: "Le salon",
      account: "Le compte",
    },
    overview: {
      eyebrow: "Vue du jour",
      greeting: "Bonjour",
      actions: {
        title: "À faire maintenant",
        confirmTitle: "À confirmer",
        confirmLabel: "rendez-vous attendent une confirmation",
        confirmHint:
          "Pris en ligne : un appel, et ils passent en confirmé dans l'agenda.",
        confirmNone: "tout est confirmé pour aujourd'hui.",
        confirmCta: "Ouvrir les rendez-vous",
        nextTitle: "Prochain rendez-vous",
        nextNone: "Aucun rendez-vous à venir.",
        nextCta: "Voir l'agenda",
        siteTitle: "Votre vitrine",
        siteBody: "Votre page est en ligne et prend les réservations à toute heure.",
        siteNoSlug: "Renseignez l'adresse de votre vitrine pour la publier.",
        siteCta: "Ouvrir la vitrine",
        siteSettings: "Ouvrir les réglages",
      },
      body: "Voici l'état de votre salon. Les écrans de travail s'ouvrent depuis la colonne de gauche.",
      salonLabel: "Votre salon",
      accountLabel: "Votre compte",
      roleLabel: "Rôle",
      signedInAs: "Connecté en tant que",
      /* Tableau de bord : ce qu'on regarde en arrivant. Les quatre chiffres
         viennent de `/dashboard`, les compteurs de `/tenant/stats`. */
      /* Mise en route : la seule partie de l'écran qui dit où l'on en est dans
         l'installation du salon. Chaque étape est vérifiée sur une donnée réelle
         (`/tenant/me`, `/tenant/stats`) — jamais sur un clic mémorisé. */
      setupTitle: "Mise en route",
      setupBody:
        "Cinq étapes, dans l'ordre de la journée : à la fin, votre vitrine prend les réservations et votre agenda se remplit tout seul.",
      setupDone: "Fait",
      setupTodo: "À faire",
      setupCta: "Ouvrir",
      setupAllDone: "Tout est en place. Votre salon peut travailler.",
      setupSteps: [
        {
          key: "slug",
          title: "Adresse de la vitrine",
          hint: "Le lien que vos clientes ouvrent pour réserver.",
        },
        {
          key: "services",
          title: "Prestations publiées",
          hint: "Prix, durée et réservation en ligne, prestation par prestation.",
        },
        {
          key: "staff",
          title: "Équipe",
          hint: "Qui travaille, et sur quels créneaux.",
        },
        {
          key: "gallery",
          title: "Photos du salon",
          hint: "Ce que la vitrine montre avant le premier rendez-vous.",
        },
        {
          key: "booking",
          title: "Premier rendez-vous",
          hint: "La preuve que la chaîne complète fonctionne.",
        },
      ],
      todayAppointments: "Rendez-vous du jour",
      todayPending: "En attente",
      todayCompleted: "Terminés",
      todayRevenue: "Recette du jour",
      upcoming: "À venir",
      recent: "Derniers rendez-vous",
      noneUpcoming: "Aucun rendez-vous à venir.",
      noneRecent: "Aucun rendez-vous passé pour l'instant.",
      countsTitle: "Le salon en un coup d'œil",
      countsCustomers: "clientes",
      countsServices: "prestations",
      countsStaff: "membres",
      countsGallery: "photos",
      nextStepsTitle: "Vos écrans de travail",
      nextStepsBody:
        "Rendez-vous, clientèle, prestations et équipe sont dans la colonne de gauche, branchés sur l'API du salon. Chaque écran montre ce que le serveur renvoie, et le dit quand il n'y a rien à afficher.",
    },
    /* Écrans de données : rendez-vous, clients, prestations, équipe. Le vocabulaire
       est celui du métier (« cliente », « prestation »), jamais celui de l'API
       (`customers`, `salon-services`). Les colonnes sont nommées ici parce que les
       quatre écrans les partagent mot pour mot. */
    screens: {
      appointments: {
        title: "Rendez-vous",
        lead: "La journée choisie, heure par heure.",
        dateLabel: "Jour",
        count: "rendez-vous",
        columns: {
          time: "Heure",
          customer: "Cliente",
          service: "Prestation",
          staff: "Avec",
          price: "Prix",
          status: "Statut",
          actions: "Actions",
        },
        actions: {
          confirm: "Confirmer",
          start: "Démarrer",
          complete: "Terminer",
          cancel: "Annuler",
          noShow: "Absent",
        },
        statuses: {
          PENDING: "En attente",
          CONFIRMED: "Confirmé",
          IN_PROGRESS: "En cours",
          COMPLETED: "Terminé",
          CANCELLED: "Annulé",
          NO_SHOW: "Absent",
        },
        add: "Nouveau rendez-vous",
        reschedule: "Replanifier",
        remove: "Supprimer",
        removeQuestion: "Supprimer ce rendez-vous ?",
        removeBusy: "Suppression…",
        form: {
          addTitle: "Nouveau rendez-vous",
          editTitle: "Replanifier le rendez-vous",
          body: "La prestation fixe la durée et le tarif ; le créneau, c'est vous qui le posez.",
          fields: {
            customer: "Cliente",
            service: "Prestation",
            staff: "Avec",
            date: "Jour",
            time: "Heure",
            notes: "Notes",
          },
          choose: "Choisir…",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
        },
        unknownCustomer: "Cliente inconnue",
        unknownService: "Prestation supprimée",
        emptyTitle: "Aucun rendez-vous ce jour-là",
        emptyBody:
          "Choisissez une autre date, ou laissez vos clientes réserver en ligne : les rendez-vous arrivent ici d'eux-mêmes.",
      },
      customers: {
        title: "Clientèle",
        lead: "Le fichier du salon, cherchable en une frappe.",
        searchLabel: "Rechercher",
        searchPlaceholder: "Un nom, un téléphone, un e-mail…",
        count: "clientes",
        columns: {
          name: "Nom",
          phone: "Téléphone",
          email: "E-mail",
          visits: "Visites",
          spent: "Dépensé",
          source: "Origine",
        },
        sources: {
          WALK_IN: "Passage",
          ONLINE: "En ligne",
          REFERRAL: "Recommandation",
          SOCIAL: "Réseaux",
          OTHER: "Autre",
        },
        emptyTitle: "Aucune cliente pour l'instant",
        emptyBody:
          "Les fiches se créent à la première réservation en ligne, ou à la main depuis l'agenda.",
        noResultsTitle: "Aucun résultat",
        noResultsBody: "Essayez un autre nom, un autre numéro ou une autre adresse.",
        add: "Ajouter une cliente",
        edit: "Modifier",
        remove: "Supprimer",
        removeQuestion: "Supprimer cette fiche et son historique ?",
        removeBusy: "Suppression…",
        form: {
          addTitle: "Nouvelle cliente",
          editTitle: "Modifier la fiche",
          body: "Prénom, nom et téléphone : le reste se complète au fil des visites.",
          fields: {
            firstName: "Prénom",
            lastName: "Nom",
            phone: "Téléphone",
            email: "E-mail",
            notes: "Notes",
            tags: "Étiquettes",
            source: "Origine",
          },
          tagsHint: "Séparées par des virgules",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
          invalidEmail: "Adresse e-mail invalide",
        },
      },
      services: {
        title: "Prestations",
        lead: "Le catalogue, durée et tarif compris.",
        count: "prestations",
        columns: {
          name: "Prestation",
          category: "Catégorie",
          duration: "Durée",
          price: "Tarif",
          online: "En ligne",
          state: "État",
        },
        online: "Réservable",
        inPerson: "Sur place",
        active: "Active",
        inactive: "Inactive",
        add: "Ajouter une prestation",
        edit: "Modifier",
        remove: "Supprimer",
        removeQuestion: "Retirer cette prestation du catalogue ?",
        removeBusy: "Suppression…",
        form: {
          addTitle: "Nouvelle prestation",
          editTitle: "Modifier la prestation",
          body: "Un nom, une durée, un tarif : c'est ce que la vitrine affiche et ce que la réservation utilise.",
          categoryHint: "Les catégories déjà employées sont proposées",
          fields: {
            name: "Prestation",
            category: "Catégorie",
            duration: "Durée (min)",
            price: "Tarif",
            description: "Description",
          },
          active: "Active au catalogue",
          bookableOnline: "Réservable en ligne",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
          invalidNumber: "Un nombre est attendu",
        },
        emptyTitle: "Le catalogue est vide",
        emptyBody:
          "Une prestation décrit ce que le salon vend : un nom, une durée, un tarif. Elle devient réservable dès qu'elle est publiée.",
      },
      staff: {
        title: "Équipe",
        lead: "Qui travaille ici, et à quel titre.",
        count: "membres",
        columns: {
          name: "Nom",
          role: "Poste",
          specialties: "Spécialités",
          commission: "Commission",
          state: "État",
        },
        active: "Actif",
        inactive: "Inactif",
        add: "Ajouter un membre",
        edit: "Modifier",
        remove: "Supprimer",
        removeQuestion: "Retirer ce membre de l'équipe ?",
        removeBusy: "Suppression…",
        availability: "Disponibilités",
        form: {
          addTitle: "Nouveau membre",
          editTitle: "Modifier le membre",
          body: "Prénom et nom suffisent ; le poste et les spécialités situent la personne dans l'équipe.",
          fields: {
            firstName: "Prénom",
            lastName: "Nom",
            title: "Poste",
            email: "E-mail",
            phone: "Téléphone",
            specialties: "Spécialités",
            commission: "Commission (%)",
          },
          specialtiesHint: "Séparées par des virgules",
          active: "Actif au planning",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
          invalidNumber: "Un pourcentage est attendu",
        },
        availabilitySheet: {
          title: "Disponibilités",
          body: "Les heures où ce membre reçoit, semaine après semaine.",
          closed: "Aucun créneau",
          addSlot: "Ajouter un créneau",
          removeSlot: "Retirer",
          from: "De",
          to: "À",
          open: "Ouvert",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          invalid: "L'heure de fin doit suivre l'heure de début.",
          hint: "La semaine envoyée remplace la précédente ; un jour sans créneau reste fermé en ligne.",
        },
        emptyTitle: "Aucun membre d'équipe",
        emptyBody:
          "Un membre ajouté reçoit ses rendez-vous et ses disponibilités ; sans équipe, la réservation en ligne reste fermée.",
      },
      reviews: {
        title: "Avis",
        lead: "Ce que les clientes disent, avant et après publication.",
        count: "avis",
        tabs: { pending: "En attente", published: "Publiés", all: "Tous" },
        columns: {
          client: "Cliente",
          rating: "Note",
          comment: "Commentaire",
          source: "Origine",
          state: "État",
        },
        states: { pending: "À publier", published: "Publié" },
        approve: "Publier",
        add: "Saisir un avis",
        remove: "Supprimer",
        removeQuestion: "Supprimer cet avis ?",
        removeBusy: "Suppression…",
        form: {
          title: "Avis reçu au comptoir",
          body: "La note d'abord, le commentaire si la personne en a laissé un. L'avis part en modération.",
          fields: {
            rating: "Note",
            customerName: "Nom de la personne",
            comment: "Commentaire",
          },
          customerNameHint: "Laisser vide pour un avis anonyme",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
        },
        anonymous: "Cliente anonyme",
        sources: { PUBLIC: "Vitrine", INTERNAL: "Salon" },
        stats: { total: "Avis reçus", pending: "À publier", average: "Moyenne" },
        note: "Un avis déposé sur la vitrine n'apparaît qu'après publication.",
        emptyTitle: "Aucun avis dans cet onglet",
        emptyBody: "Les avis déposés depuis la vitrine arrivent ici, en attente de publication.",
      },
      messages: {
        title: "Messages",
        lead: "Les demandes envoyées depuis la vitrine du salon.",
        count: "messages",
        tabs: { unread: "Non lus", all: "Tous" },
        markRead: "Marquer comme lu",
        remove: "Supprimer",
        removeQuestion: "Supprimer ce message ?",
        removeBusy: "Suppression…",
        read: "Lu",
        unread: "Nouveau",
        noSubject: "(sans objet)",
        emptyTitle: "Aucun message",
        emptyBody: "Les demandes de contact envoyées depuis la vitrine apparaissent ici.",
        emptyUnreadTitle: "Tout est lu",
        emptyUnreadBody: "Aucun message non lu ne reste dans la boîte.",
      },
      gallery: {
        title: "Galerie",
        lead: "Les photos publiées sur la vitrine du salon.",
        count: "photos",
        noCaption: "Sans légende",
        add: "Ajouter une photo",
        remove: "Supprimer",
        removeQuestion: "Supprimer cette photo ?",
        removeBusy: "Suppression…",
        uploadTitle: "Nouvelle photo",
        uploadBody:
          "JPEG, PNG ou WebP, 10 Mo au plus. La photo rejoint la vitrine dès qu'elle est envoyée.",
        fields: {
          file: "Image",
          caption: "Légende",
          tags: "Étiquettes",
        },
        tagsHint: "Séparées par des virgules",
        chooseFile: "Choisir une image",
        upload: "Envoyer",
        uploading: "Envoi…",
        cancel: "Annuler",
        noFile: "Choisissez une image.",
        tooBig: "Cette image dépasse 10 Mo.",
        notImage: "Ce fichier n'est pas une image.",
        emptyTitle: "La galerie est vide",
        emptyBody: "Les photos ajoutées au salon s'affichent sur sa vitrine et ici.",
        note: "Les photos s'ajoutent depuis cet écran et s'affichent aussitôt sur la vitrine.",
      },
      billing: {
        title: "Abonnement",
        lead: "Le forfait en cours et son historique.",
        current: "Forfait en cours",
        fields: { plan: "Forfait", status: "État", price: "Montant mensuel", start: "Depuis", trial: "Essai jusqu'au", end: "Fin" },
        statuses: {
          ACTIVE: "Actif",
          SUSPENDED: "Suspendu",
          CANCELLED: "Résilié",
          TRIAL: "Essai",
          EXPIRED: "Expiré",
        },
        history: "Historique",
        limits: {
          title: "Ce que le forfait autorise",
          customers: "Clientes",
          staff: "Membres d'équipe",
          gallery: "Photos",
          appointments: "Rendez-vous / mois",
        },
        unlimited: "illimité",
        columns: { plan: "Forfait", status: "État", start: "Du", end: "Au", price: "Montant" },
        emptyTitle: "Aucun abonnement en cours",
        emptyBody: "L'abonnement du salon apparaîtra ici dès qu'il sera souscrit.",
        note: "Aucun paiement n'est possible depuis l'application : le forfait se change avec l'équipe Belora.",
      },
      analytics: {
        title: "Statistiques",
        lead: "La période choisie, en chiffres — sans tableur.",
        from: "Du",
        to: "Au",
        revenue: "Chiffre d'affaires",
        averageTicket: "Panier moyen",
        appointments: "Rendez-vous",
        completed: "Terminés",
        cancelled: "Annulés",
        clients: "Clientes",
        newClients: "Nouvelles",
        retention: "Fidélisation",
        topServices: "Prestations les plus demandées",
        topStaff: "Membres les plus sollicités",
        columns: { name: "Nom", count: "Rendez-vous", revenue: "Montant" },
        byDay: "Chiffre d'affaires par jour",
        emptyTitle: "Rien à mesurer sur cette période",
        emptyBody: "Choisissez une période plus large, ou enregistrez un premier rendez-vous.",
        noData: "—",
      },
      calendar: {
        title: "Calendrier",
        lead: "Ce qui est pris, et ce qui reste libre.",
        dateLabel: "Jour",
        staffLabel: "Membre",
        allStaff: "Toute l'équipe",
        busy: "Occupé",
        free: "Créneaux libres",
        emptyBusy: "Aucun rendez-vous ce jour-là.",
        emptyFree: "Aucun créneau libre : ni horaires publiés, ni place restante.",
      },
      audit: {
        title: "Journal",
        lead: "Les actions enregistrées sur le salon.",
        count: "entrées",
        authorLabel: "Auteur",
        allAuthors: "Tout le salon",
        columns: {
          date: "Date",
          action: "Action",
          entity: "Objet",
          user: "Auteur",
          ip: "IP",
        },
        /* Vue « pipeline » : le journal se lit de haut en bas comme une suite d'étapes, avec un
           rail, un nœud par action et des journées séparées. */
        families: {
          create: "Créé",
          update: "Modifié",
          delete: "Supprimé",
          session: "Session",
          other: "Autre",
        },
        today: "Aujourd'hui",
        yesterday: "Hier",
        by: "par",
        machine: "Tâche du salon",
        legend: "Familles",
        periodLabel: "Période",
        authorsLabel: "Auteurs",
        agentLabel: "Navigateur",
        emptyTitle: "Journal vide",
        emptyBody:
          "Les actions (connexion, création, modification) s'inscrivent ici au fil de l'eau.",
      },
      notifications: {
        title: "Notifications",
        lead: "Ce que le salon vous a signalé.",
        count: "notifications",
        markRead: "Marquer comme lu",
        statuses: {
          PENDING: "En attente",
          SENT: "Envoyée",
          FAILED: "Échec",
          READ: "Lue",
        },
        channels: {
          EMAIL: "E-mail",
          SMS: "SMS",
          PUSH: "Push",
          IN_APP: "Dans l'application",
        },
        emptyTitle: "Aucune notification",
        emptyBody: "Les confirmations et rappels envoyés par le salon apparaîtront ici.",
      },
      accounts: {
        title: "Comptes et accès",
        lead: "Qui peut se connecter au salon, et à quel titre.",
        count: "comptes",
        columns: {
          name: "Personne",
          role: "Rôle",
          lastLogin: "Dernière connexion",
          state: "État",
        },
        roles: {
          OWNER: "Propriétaire",
          ADMIN: "Administrateur",
          MANAGER: "Responsable",
          STAFF: "Équipe",
          SUPER_ADMIN: "Plateforme",
        },
        you: "vous",
        active: "Actif",
        inactive: "Inactif",
        neverLoggedIn: "Jamais connecté",
        add: "Ouvrir un accès",
        edit: "Modifier",
        remove: "Supprimer",
        removeQuestion: "Supprimer cet accès ?",
        removeBusy: "Suppression…",
        form: {
          addTitle: "Nouvel accès",
          editTitle: "Modifier l'accès",
          body: "Un accès, c'est une adresse, un mot de passe et un rôle : ce que la personne pourra faire dans le salon.",
          fields: {
            firstName: "Prénom",
            lastName: "Nom",
            email: "E-mail",
            phone: "Téléphone",
            role: "Rôle",
            password: "Mot de passe",
            newPassword: "Nouveau mot de passe",
          },
          passwordHint: "8 caractères au minimum",
          newPasswordHint: "Laisser vide pour ne pas changer",
          activeLabel: "Accès ouvert",
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
          invalidEmail: "Adresse e-mail invalide",
          shortPassword: "8 caractères au minimum",
        },
        emptyTitle: "Aucun compte",
        emptyBody: "Seul le compte propriétaire existe pour l'instant.",
      },
      settings: {
        title: "Réglages",
        lead: "L'identité du salon, son apparence et ce qu'il a publié.",
        identity: "Identité",
        impactIdentity:
          "Le nom et l'adresse apparaissent sur votre vitrine, dans la colonne de cet espace et sur votre page de réservation. Enregistrez, la colonne se met à jour sans recharger.",
        appearance: "Apparence et réseaux",
        impactAppearance:
          "Les couleurs s'appliquent à votre vitrine ET à cet espace. Enregistrez : la colonne de gauche change de couleur immédiatement.",
        socials: "Réseaux",
        counters: "Contenu publié",
        colors: {
          primary: "Couleur primaire",
          secondary: "Couleur secondaire",
          accent: "Accent",
        },
        fields: {
          name: "Nom",
          slug: "Adresse",
          email: "E-mail",
          phone: "Téléphone",
          address: "Adresse postale",
          city: "Ville",
          country: "Pays",
          timezone: "Fuseau horaire",
          plan: "Forfait",
          description: "Description",
          website: "Site web",
          users: "Comptes",
          customers: "Clientes",
          staff: "Équipe",
          services: "Prestations",
          appointments: "Rendez-vous",
          gallery: "Photos",
        },
        editIdentity: "Modifier l'identité",
        editAppearance: "Modifier l'apparence",
        form: {
          identityTitle: "Identité du salon",
          identityBody:
            "Le nom et le slug sont publics : ils composent l'adresse de la vitrine. Le reste sert aux échanges avec vos clientes.",
          appearanceTitle: "Apparence et réseaux",
          appearanceBody:
            "Les couleurs s'appliquent à la vitrine. Logo, favicon et bandeau sont des adresses d'images hébergées.",
          fields: {
            name: "Nom",
            slug: "Adresse",
            email: "E-mail",
            phone: "Téléphone",
            address: "Adresse postale",
            city: "Ville",
            country: "Pays",
            timezone: "Fuseau horaire",
            logo: "Logo (URL)",
            favicon: "Favicon (URL)",
            heroImage: "Bandeau (URL)",
            description: "Description",
            primaryColor: "Couleur principale",
            secondaryColor: "Couleur secondaire",
            accentColor: "Accent",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            twitter: "X",
            website: "Site",
            whatsapp: "WhatsApp",
          },
          save: "Enregistrer",
          saving: "Enregistrement…",
          cancel: "Annuler",
          required: "Champ obligatoire",
          invalidEmail: "Adresse e-mail invalide",
          invalidColor: "Couleur hexadécimale attendue (#0F172A)",
          slugHint: "Minuscules, chiffres et tirets",
        },
      },
    },

    /* États partagés par tous les écrans de l'espace : un chargement qui ne dit
       rien, un vide qui dit quoi faire, une erreur qui dit quoi refaire. */
    loading: "Chargement…",
    cancel: "Annuler",
    errorTitle: "Impossible de charger cette page",
    errorBody: "La requête n'a pas abouti. Vérifiez votre connexion, puis réessayez.",
    retry: "Réessayer",
    emptyTitle: "Rien à afficher pour l'instant",
    emptyBody: "Cet endroit se remplira dès la première donnée enregistrée.",
  },

  /* Section « démo » de l'accueil : la vitrine du salon de démonstration, chargée
     en direct. Les étiquettes nomment ce que l'API rapporte, jamais autre chose. */
  demo: {
    eyebrow: "En direct",
    title: "Un vrai salon, lu en direct",
    body:
      "Rien n'est mis en scène : le nom, les couleurs, les prestations et l'équipe sont ceux du salon de démonstration, servis par l'API du produit pendant que la page s'affiche.",
    servicesLabel: "Prestations",
    teamLabel: "Équipe",
    bookingLabel: "Réservation",
    bookingOpen: "Ouverte 24 h/24",
    bookingClosed: "Fermée pour l'instant",
    cta: "Voir cette page pour mon salon",
    empty: "Rien n'est encore publié sur ce salon.",
    unavailable: "Le salon de démonstration est injoignable pour l'instant.",
  },

  /* Témoignages de l'accueil : le cadre est ici, les CITATIONS ne le sont pas — elles
     viennent des avis publiés par le salon de démonstration (lues sur l'API), ou de
     `testimonials` si l'exploitant y autorise des citations avec photo. */
  testimonials: {
    eyebrow: "Témoignages",
    title: "Des mots simples, un effet durable.",
    says: "dit…",
    previous: "Témoignage précédent",
    next: "Témoignage suivant",
    source: "Avis publiés par le salon",
  },
};

/**
 * Forfaits — VALEURS ÉCRITES EN DUR, et c'est volontaire.
 *
 * `GET /subscriptions/plans` renvoie **401** sans jeton, même s'il est décrit
 * comme public dans le Swagger (constat du 2026-10-16, refait le jour même) :
 * une page marketing ne peut donc pas lire ses propres prix avant connexion.
 * Les montants et les quotas ci-dessous sont ceux du backend, relevés sur son
 * endpoint authentifié. S'ils bougent côté serveur, ICI aussi — et surtout,
 * aucun paiement n'est en ligne (aucun checkout dans l'API) : les boutons
 * mènent à l'inscription, jamais à une transaction.
 */
export const pricing = {
  eyebrow: "Tarifs",
  recommended: "Le plus choisi",
  title: "Quatre forfaits, un seul outil.",
  lead:
    "Le prix est écrit noir sur blanc : aucun forfait ne demande à « nous consulter » pour savoir ce que coûte Belora.",
  note: "Les quotas ci-dessous sont ceux du forfait ; ils sont rappelés à la création de votre salon.",
  facts: [
    { value: "14 jours", label: "Pour essayer" },
    { value: "Sans", label: "Engagement" },
    { value: "1 salon", label: "Par compte" },
  ],
  plans: [
    {
      name: "Free",
      price: "0 €",
      period: "pour toujours",
      tagline: "Pour ouvrir sa vitrine",
      features: ["1 coiffeur", "50 clients", "20 photos", "Réservation en ligne"],
      recommended: false,
    },
    {
      name: "Basic",
      price: "29 €",
      period: "/ mois",
      tagline: "Pour une activité qui grandit",
      features: ["5 coiffeurs", "300 clients", "200 photos", "Couleurs personnalisées"],
      recommended: true,
    },
    {
      name: "Pro",
      price: "79 €",
      period: "/ mois",
      tagline: "Pour les salons établis",
      features: [
        "Équipe et rendez-vous illimités",
        "Statistiques avancées",
        "Notifications SMS",
        "Accès API",
      ],
      recommended: false,
    },
    {
      name: "Enterprise",
      price: "199 €",
      period: "/ mois",
      tagline: "Pour les groupes de salons",
      features: ["Tout le plan Pro", "Domaine personnalisé", "Accompagnement dédié"],
      recommended: false,
    },
  ],
  cta: "Ouvrir un salon",
};

/**
 * Questions fréquentes — posées juste APRÈS les forfaits, à l'endroit exact où les cinq
 * objections reviennent avant l'inscription. Le même bloc alimente le JSON-LD `FAQPage` de
 * la page d'accueil : ce qu'on affiche et ce qu'on déclare ne peuvent pas diverger.
 */
export const faq = {
  eyebrow: "Questions fréquentes",
  title: "Ce qu'on nous demande avant d'ouvrir un salon.",
  lead:
    "Cinq questions posées par des propriétaires avant de basculer leur activité sur Belora — répondues sans détour.",
  items: [
    {
      q: "Belora remplace-t-il mon agenda papier ?",
      a: "Oui. Prestations, équipe et clientes sont saisies une fois ; l'agenda se remplit tout seul à chaque réservation, et chaque fiche client garde l'historique de ses rendez-vous.",
    },
    {
      q: "Mes clientes peuvent-elles réserver la nuit ?",
      a: "Oui. Votre page de réservation répond 24 h/24 : une cliente peut prendre rendez-vous à 23 h, et vous le voyez dès le premier écran de votre tableau de bord.",
    },
    {
      q: "Que voit une coiffeuse en se connectant ?",
      a: "Son planning et ses fiches clientes, rien d'autre. Les tarifs, les statistiques et les réglages du salon restent entre vos mains.",
    },
    {
      q: "Puis-je essayer avant de payer ?",
      a: "Le forfait Free est gratuit pour toujours, sans carte bancaire : il ouvre votre vitrine avec une coiffeuse, cinquante clientes et la réservation en ligne.",
    },
    {
      q: "Que deviennent mes données ?",
      a: "Elles restent les vôtres : export à la demande, aucun partage avec des tiers, et rien n'est perdu si vous changez de forfait.",
    },
  ],
};

/**
 * Vitrine publique d'un salon — `/[lang]/s/[slug]`.
 *
 * C'est ici que la promesse de l'accueil devient vraie : chaque salon a SA page,
 * à ses couleurs, avec SES prestations et SES créneaux. Les libellés nomment ce
 * que l'API renvoie ; les états vides disent quoi faire, et aucune phrase ne
 * promet ce que le contrat ne porte pas (pas de paiement en ligne, avis publié
 * après validation).
 */
export const storefront = {
  book: "Réserver",
  bookOnline: "Réserver en ligne",
  bookingClosed: "Ce salon ne prend pas encore de réservation en ligne.",
  poweredBy: "Vitrine propulsée par",
  backHome: "Retour à l'accueil",
  /* Le slug ne correspond à aucun salon : c'est le serveur qui l'a dit (404). */
  notFoundTitle: "Ce salon n'existe pas — ou plus.",
  notFoundBody:
    "L'adresse demandée ne correspond à aucune vitrine. Vérifiez le lien que vous avez reçu.",
  /* L'API ne répond pas : on ne sait rien du salon, et on le dit. */
  unavailableTitle: "La vitrine est momentanément indisponible",
  unavailableBody: "Le serveur du salon ne répond pas. Réessayez dans un instant.",
  loading: "Chargement de la vitrine…",
  retry: "Réessayer",
  sections: {
    services: "Prestations",
    team: "L'équipe",
    gallery: "Galerie",
    reviews: "Avis",
    booking: "Réservation",
    contact: "Contact",
  },
  servicesAll: "Tout",
  reachTitle: "Nous joindre",
  website: "Site web",
  servicesIntro: "Durées et tarifs affichés par le salon.",
  servicesEmpty: "Le salon n'a pas encore publié ses prestations.",
  teamEmpty: "L'équipe n'est pas encore présentée.",
  galleryEmpty: "Aucune photo publiée pour l'instant.",
  reviewsEmpty: "Pas encore d'avis publié.",
  reviewsNote: "Les avis sont publiés après validation du salon.",
  average: "moyenne",
  reviewsCount: "avis",
  priceCurrency: "€",
  breadcrumb: "Vitrine du salon",
  booking: {
    title: "Prendre rendez-vous",
    lead: "Trois étapes : la prestation, l'heure, vos coordonnées.",
    steps: { service: "Prestation", slot: "Créneau", details: "Coordonnées" },
    stepLabel: "Étape",
    of: "sur",
    min: "min",
    chooseService: "Choisissez une prestation",
    chooseStaff: "Avec qui ?",
    anyStaff: "Peu importe",
    chooseDay: "Choisissez un jour",
    chooseTime: "Choisissez une heure",
    noSlots: "Aucun créneau libre ce jour-là. Essayez une autre date.",
    slotsError: "Les créneaux n'ont pas pu être chargés.",
    slotsLoading: "Recherche des créneaux…",
    next: "Continuer",
    back: "Retour",
    confirm: "Confirmer le rendez-vous",
    sending: "Envoi…",
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Téléphone",
      email: "E-mail (facultatif)",
      notes: "Précisions (facultatif)",
      notesPlaceholder: "Une préférence, une allergie, un retard prévu…",
    },
    required: "Champ obligatoire",
    invalidEmail: "Adresse e-mail invalide",
    invalidPhone: "Numéro de téléphone invalide",
    noStaff: "L'équipe n'est pas encore publiée : la réservation en ligne ouvrira dès qu'un membre sera ajouté.",
    phoneHint: "Le salon vous rappelle sur ce numéro en cas de changement.",
    summary: "Récapitulatif",
    at: "à",
    change: "Modifier",
    successTitle: "Rendez-vous envoyé",
    successBody:
      "Le salon a reçu votre demande. Il vous confirme le rendez-vous par téléphone.",
    newBooking: "Prendre un autre rendez-vous",
    error: "La réservation n'a pas abouti. Vérifiez vos informations, puis réessayez.",
    slotTaken: "Ce créneau vient d'être pris. Choisissez-en un autre.",
    closedError: "Ce salon n'accepte pas de réservation en ligne pour le moment.",
  },
  contact: {
    lead: "Une question sur une prestation, un tarif ou un horaire ? Écrivez au salon.",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone (facultatif)",
    subject: "Objet (facultatif)",
    message: "Message",
    required: "Champ obligatoire",
    invalidEmail: "Adresse e-mail invalide",
    requiredHint: "* champs obligatoires",
    submit: "Envoyer le message",
    sending: "Envoi…",
    successTitle: "Message envoyé",
    successBody: "Le salon a reçu votre message et vous répond par e-mail.",
    again: "Écrire un autre message",
    error: "Le message n'a pas pu être envoyé. Réessayez dans un instant.",
  },
  review: {
    title: "Laisser un avis",
    lead: "Votre note aide les prochaines clientes à choisir.",
    rating: "Votre note",
    name: "Votre nom (facultatif)",
    comment: "Votre commentaire (facultatif)",
    commentPlaceholder: "Ce qui vous a plu, ce qui pourrait être amélioré…",
    requiredRating: "Choisissez une note entre 1 et 5.",
    submit: "Publier mon avis",
    sending: "Envoi…",
    successTitle: "Merci pour votre avis",
    successBody:
      "Il sera publié sur la vitrine après validation par le salon.",
    again: "Laisser un autre avis",
    error: "L'avis n'a pas pu être envoyé. Réessayez dans un instant.",
  },
};

const dictionary = {
  site, nav, services, hero, about, projects, filters,
  testimonials, aboutPage, servicesPage, contactPage, finalCta, clients, pricing, faq,
  storefront, showcase, ui,
};

export default dictionary;
