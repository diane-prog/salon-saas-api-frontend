export const site = {
  name: "LEEGI Group",
  tagline: "Agence de communication digitale basée à Dakar. Nous transformons vos ambitions en succès numériques.",
  phone: "+221 78 122 93 05",
  phoneRaw: "tel:+221781229305",
  email: "contact@leegigroup.com",
  address: "Dakar, Sénégal",
  hours: "Lun-Ven, 9h-18h",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/leegi-group/" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61579376777474" },
    { label: "X", href: "https://x.com/Leegigroup" },
    { label: "TikTok", href: "https://www.tiktok.com/@leegigroup" },
    { label: "Instagram", href: "https://www.instagram.com/leegigroup/" },
  ],
};

export const nav = [
  { label: "Accueil", href: "/" },
  { label: "A propos", href: "/a-propos" },
  { label: "Services", href: "/services" },
  { label: "Réalisations", href: "/realisations" },
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
  image: string;
};

export const services: Service[] = [
  {
    slug: "branding",
    title: "Branding",
    short: "Création de logos, chartes graphiques et identités de marque mémorables qui marquent les esprits.",
    heroTitle: "Branding",
    heroSubtitle: "Construisez une identité forte et mémorable",
    whyTitle: "Pourquoi le branding ?",
    whyBody:
      "Votre marque est bien plus qu'un logo. Nous créons des identités visuelles complètes qui racontent votre histoire et captivent votre audience. De la conception du logo à la charte graphique complète, chaque élément est pensé pour traduire qui vous êtes, inspirer confiance et vous imposer dans l'esprit de vos clients.",
    offerings: [
      "Création de logo",
      "Charte graphique complète",
      "Identité visuelle",
      "Mockups & déclinaisons",
      "Guide de marque",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Découverte", body: "Analyse de votre marché, vos valeurs et vos objectifs" },
      { title: "Création", body: "Conception de propositions créatives et originales" },
      { title: "Raffinement", body: "Ajustements et perfectionnement du design choisi" },
      { title: "Livraison", body: "Fichiers finaux et charte graphique complète" },
    ],
    ctaTitle: "Prêt à booster votre branding ?",
    ctaBody:
      "Discutons de votre projet et construisons ensemble une identité de marque qui vous ressemble et vous démarque.",
    image: "/img/projet-setna.jpg",
  },
  {
    slug: "site-web",
    title: "Création de Sites Web",
    short: "Sites web modernes, performants et optimisés pour une expérience utilisateur exceptionnelle.",
    heroTitle: "Site Web",
    heroSubtitle: "Votre vitrine digitale haute performance",
    whyTitle: "Pourquoi le site web ?",
    whyBody:
      "Votre site web est votre meilleur commercial. Nous créons des sites modernes, rapides et optimisés pour convertir vos visiteurs en clients. Responsive, SEO-friendly et conçu pour performer.",
    offerings: [
      "Sites vitrines",
      "E-commerce",
      "Design responsive",
      "Optimisation performance",
      "Maintenance & support",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Wireframes", body: "Architecture et structure de l'information" },
      { title: "Design", body: "Création de maquettes modernes et ergonomiques" },
      { title: "Développement", body: "Intégration et développement technique" },
      { title: "Lancement", body: "Tests, optimisation et mise en ligne" },
    ],
    ctaTitle: "Prêt à booster votre votre site web ?",
    ctaBody:
      "Discutons de votre projet et créons ensemble un site qui travaille pour vous 24h/24.",
    image: "/img/projet-emf.jpg",
  },
  {
    slug: "seo",
    title: "Seo",
    short: "Audit, optimisation et stratégie pour mieux positionner votre site et dominer les résultats de recherche.",
    heroTitle: "Seo",
    heroSubtitle: "Dominez les résultats de recherche",
    whyTitle: "Pourquoi le seo ?",
    whyBody:
      "Être invisible sur Google, c'est comme ne pas exister. Notre expertise SEO vous propulse en tête des résultats de recherche, attirant un flux constant de prospects qualifiés vers votre site web. Nous optimisons votre site, votre contenu et votre stratégie pour améliorer durablement votre positionnement. Résultat : plus de visibilité, plus de trafic et plus d'opportunités pour votre entreprise.",
    offerings: [
      "Audit SEO complet",
      "Recherche de mots-clés",
      "Optimisation on-page",
      "Netlinking stratégique",
      "SEO local",
      "Suivi et rapports",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Audit", body: "Analyse technique et sémantique de votre site" },
      { title: "Stratégie", body: "Plan d'action personnalisé et priorisé" },
      { title: "Optimisation", body: "Mise en œuvre des recommandations techniques et contenu" },
      { title: "Suivi", body: "Rapports mensuels et ajustements continus" },
    ],
    ctaTitle: "Prêt à booster votre seo ?",
    ctaBody: "Discutons de votre projet et faisons de Google votre meilleur commercial.",
    image: "/img/projet-comprint.jpg",
  },
  {
    slug: "contenu-reels-spots",
    title: "Contenu, Réels & Spots",
    short:
      "Visuels, articles et vidéos percutantes conçus pour capter l'attention, et engager votre audience",
    heroTitle: "Contenus, Reels & Spots publicitaires",
    heroSubtitle: "Engagez et marquez les esprits",
    whyTitle: "Pourquoi la création de contenu, les Reels et les spots pub ?",
    whyBody:
      "Capter l'attention ne suffit plus : il faut marquer les esprits. Chez LEEGI Group, nous créons des contenus visuels et vidéos pensés pour attirer, engager et convaincre votre audience. Du contenu pour les réseaux sociaux, aux Réels dynamiques, jusqu'aux spots publicitaires impactant, chaque création valorise votre marque et transmet votre message avec force.",
    offerings: [
      "Visuels réseaux sociaux",
      "Stratégie éditoriale",
      "Articles de blog",
      "Post-production",
      "Motion design",
      "Storyboard",
      "Vidéos corporate",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Stratégie", body: "Définition de votre ligne éditoriale et planification des contenus" },
      { title: "Création", body: "Production de visuels, Reels et spots publicitaires percutants" },
      { title: "Diffusion", body: "Planification et publication optimisées pour chaque plateforme" },
      { title: "Analyse", body: "Mesure des performances et optimisation continue pour maximiser l'engagement" },
    ],
    ctaTitle: "Prêt à captiver votre audience ?",
    ctaBody:
      "Discutons de votre projet et créons ensemble des contenus qui attirent, marquent et convertissent.",
    image: "/img/projet-etincelles.jpg",
  },
  {
    slug: "evenementiel",
    title: "Événementiel",
    short:
      "Organisation et coordination d'événements qui marquent les esprits et boostent votre visibilité.",
    heroTitle: "Événementiel",
    heroSubtitle: "Créez des expériences mémorables",
    whyTitle: "Pourquoi le événementiel ?",
    whyBody:
      "Un événement réussi peut transformer votre image et créer des connexions durables. Nous concevons et organisons des événements sur-mesure qui marquent les esprits et renforcent votre notoriété.",
    offerings: [
      "Séminaires & conférences",
      "Lancements de produits",
      "Soirées corporate",
      "Team building",
      "Événements digitaux",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Brief", body: "Compréhension de vos objectifs et de votre audience" },
      { title: "Conception", body: "Création du concept et planification détaillée" },
      { title: "Production", body: "Coordination des prestataires et logistique" },
      { title: "Jour J", body: "Gestion et animation de l'événement" },
    ],
    ctaTitle: "Prêt à booster votre événementiel ?",
    ctaBody:
      "Discutons de votre projet et construisons ensemble un événement qui marquera les esprits",
    image: "/img/projet-escda.jpg",
  },
  {
    slug: "strategie-communication",
    title: "Communication & Marketing",
    short:
      "Planifiez, communiquez, convertissez. Analyse, et actions concrètes pour faire parler votre marque et attirer vos clients.",
    heroTitle: "stratégie de communication & marketing",
    heroSubtitle: "Transformez votre communication en résultats",
    whyTitle: "Pourquoi une stratégie de communication et marketing ?",
    whyBody:
      "Une communication sans stratégie, c'est comme parler dans le vide. Nous élaborons des stratégies claires et efficaces qui attirent les bons clients, positionnent votre marque et transforment vos actions en résultats mesurables.",
    offerings: [
      "Audit & analyse",
      "Positionnement stratégique",
      "Plan d'action marketing",
      "Contenus & campagnes",
      "Optimisation",
      "Suivi",
    ],
    processLabel: "Comment ça marche",
    processIntro: "Un processus éprouvé pour des résultats garantis.",
    steps: [
      { title: "Analyse", body: "Compréhension de votre marque, de vos objectifs et de votre audience" },
      { title: "Stratégie", body: "Définition du positionnement, du message et du plan d'action marketing" },
      { title: "Exécution", body: "Déploiement des contenus, campagnes et actions marketing" },
      { title: "Optimisation", body: "Suivi des performances et ajustements pour maximiser l'impact" },
    ],
    ctaTitle: "Prêt à booster votre communication ?",
    ctaBody:
      "Discutons de votre projet et bâtissons ensemble une stratégie qui transforme votre communication en résultats concrets.",
    image: "/img/projet-comprint.jpg",
  },
];

export const hero = {
  keywords: ["Branding", "SEO", "Sites web", "Contenu", "Événementiel", "Spots pub"],
  lead: "Faites briller votre marque.",
  body: "LEEGI GROUP transforme votre visibilité en clients, en crédibilité et en croissance. Grâce à la stratégie, la créativité et l’expertise digitale, votre communication devient un levier puissant pour attirer, convaincre et fidéliser vos clients.",
};

export const stats = [
  { value: 120, suffix: "+", label: "Projets réalisés" },
  { value: 40, suffix: "+", label: "De clients satisfaits" },
  { value: 98, suffix: "%", label: "Satisfaction client" },
  { value: 10, suffix: "+", label: "Années d'expérience" },
  { value: 60, suffix: "+", label: "Partenaires" },
];

export const about = {
  title: "À propos",
  heading: "Votre partenaire digital de confiance",
  body: "Basée au Sénégal, Leegi Group est une agence de communication digitale passionnée par la transformation numérique des entreprises africaines. Nous combinons créativité, expertise technique et connaissance approfondie des marchés africains pour des résultats exceptionnels.",
  points: [
    "Approche stratégique et personnalisée",
    "Équipe 100% dédiée à vos projets",
    "Résultats mesurables et transparents",
    "Innovation et veille technologique constante",
  ],
};

export const projects = [
  {
    title: "Dispositif visuel événementiel ESCDA 2025",
    body: "Conception et production de supports visuels pour renforcer l’impact de l’événement.",
    category: "Événementiel",
    image: "/img/projet-escda.jpg",
  },
  {
    title: "Conception du site web EMF",
    body: "Création d’un site web moderne et structuré pour renforcer la présence digitale de EMF.",
    category: "Sites web",
    image: "/img/projet-emf.jpg",
  },
  {
    title: "Comprint Maquette Ads",
    body: "Visuels créés pour capter l’attention et maximiser l’impact des campagnes publicitaires.",
    category: "Contenu digital",
    image: "/img/projet-comprint.jpg",
  },
  {
    title: "Setna Services",
    body: "Logo présenté en situation à travers des mockups professionnels.",
    category: "Branding",
    image: "/img/projet-setna.jpg",
  },
  {
    title: "Création de contenu social media",
    body: "Visuel conçu pour la campagne digitale du 8 mars pour Étincelles des Marques.",
    category: "Contenu digital",
    image: "/img/projet-etincelles.jpg",
  },
  {
    title: "Couverture 1ᵉ édition de ESCDA",
    body: "Captation image et vidéo pour valoriser les moments forts de l’événement.",
    category: "Événementiel",
    image: "/img/projet-emf.jpg",
  },
];

export const filters = ["Tous", "Branding", "Sites web", "Événementiel", "Contenu digital"];

export const testimonials = [
  {
    name: "Lamine SECK",
    role: "Directeur Général",
    company: "Com&print Multiservices",
    quote:
      "Très professionnelle et avec beaucoup d’impact. Un travail d’une grande qualité avec des résultats très probants. Si vous voulez parler de marketing et améliorer votre image de marque, faites confiance à Leegi Group.",
    image: "/img/temoignage-lamine.jpg",
  },
  {
    name: "Nestor DIATTA",
    role: "Directeur Général",
    company: "SENTRAS SARL",
    quote:
      "Je recommande vivement Leegi Group. Professionnelle, rigoureuse et adaptable, l’équipe garantit des résultats de haute qualité et apporte une réelle valeur ajoutée à chaque projet ambitieux.",
    image: "/img/temoignage-nestor.jpg",
  },
  {
    name: "Hamidou DIALLO",
    role: "Directeur Général",
    company: "Houda Ingénierie BTP",
    quote:
      "Je recommande vivement Leegi Group. Professionnelle et efficace, l’équipe accompagne les entreprises et apporte une réelle valeur à chaque projet",
    image: "/img/temoignage-hamidou.jpg",
  },
  {
    name: "Seydina A. GAYE",
    role: "Chef de projet",
    company: "Chef de projet, dév - éco et communautaire",
    quote:
      "Je recommande vivement Leegi Group. Créative,  et dynamique, l’équipe apporte des solutions efficaces en marketing digital ",
    image: "/img/temoignage-seydina.jpg",
  },
];

export const aboutPage = {
  title: "Qui sommes -nous ?",
  lead: "LEEGI Groupe booste votre visibilité grâce à une stratégie ciblée et une créativité impactante.",
  body: "Nous accompagnons les marques pour capter l'attention, seductive leur audience et développer leur influence.",
  pillars: [
    { title: "Stratégie ciblée", body: "Actions précises pour un impact maximal." },
    { title: "Créativité percutante", body: "Contenus qui attirent et marquent les esprits." },
    { title: "Résultats concrets", body: "Visibilité accrue et crédibilité renforcée." },
  ],
  mission: {
    title: "Notre mission",
    body: "Aider les entreprises à devenir visibles, crédibles et impactantes. Nous croyons que chaque marque mérite une stratégie à la hauteur de ses ambitions.",
  },
  vision: {
    title: "Notre vision",
    body: "Construire des marques fortes et durables. Nous aspirons à être le partenaire de référence pour toute entreprise souhaitant se démarquer.",
  },
  initiatives: {
    title: "Nos initiatives",
    body: "Parmi nos actions, nous portons Étincelles des Marques, une initiative de Leegi Group dédiée à révéler, valoriser et amplifier la voix des talents, marques et entreprises africaines.",
    body2:
      "À travers des portraits authentiques, des interviews approfondies et des podcasts immersifs, nous racontons des histoires vraies et inspirantes, mettant en lumière des parcours porteurs d'innovation et d'impact sur le continent africain.",
  },
  valuesTitle: "Nos valeur",
  values: [
    {
      title: "Innovation",
      body: "Nous développons des idées originales et des solutions percutantes pour faire briller votre marque.",
    },
    {
      title: "Clarté",
      body: "Chaque action est réfléchie pour atteindre un objectif précis et maximiser l'impact de votre communication.",
    },
    {
      title: "Excellence",
      body: "Nous créons des expériences de marque mémorables qui captent l'attention de votre audience.",
    },
    {
      title: "Engagement",
      body: "Nous accompagnons chaque projet avec rigueur, sérieux et un réel sens du résultat.",
    },
  ],
  teamLabel: "Notre Équipe",
  teamIntro: "Une équipe pluridisciplinaire au service de votre ambition digitale.",
  team: [
    {
      name: "Mareme SYLLA",
      role: "Directrice Générale & Cofondatrice – LEEGI Group",
      image: "/img/equipe-mareme.jpg",
      bio: [
        "Mareme SYLLA est la Directrice Générale et cofondatrice de LEEGI Group.",
        "Passionnée par le marketing et la communication stratégique, elle accompagne des entreprises locales et internationales dans le développement de leur image de marque, leur visibilité digitale et leur positionnement.",
        "Son expertise s'est construite à travers une diversité de secteurs, notamment le BTP, l'immobilier, l'automobile, le mobilier, les industries pétrolières et gazières, ainsi que les services, l'hôtellerie, l'impression et la formation, avec une forte connaissance et maîtrise du marché.",
        "À travers son parcours en marketing, vente et communication digitale, elle intervient dans la structuration des marques, de la mise en place à la réalisation de stratégies adaptées aux réalités du marché.",
        "Convaincue qu'une marque se construit sur la clarté, la cohérence et l'impact, elle défend une approche stratégique orientée résultats.",
        "Elle est également à l'origine du projet Étincelles des Marques, dédié à la valorisation des entrepreneurs et des marques africaines.",
      ],
    },
    {
      name: "Ndeye Anta Ndiaye",
      role: "Designer graphique | Développeuse web & chargée de contenu digital",
      image: "/img/equipe-ndeye.jpg",
      bio: [],
    },
    {
      name: "Cheikh Bamba Bâ",
      role: "Designer graphique & chargée de contenu digital",
      image: "/img/equipe-cheikh.jpg",
      bio: [],
    },
  ],
  why: {
    title: "Pourquoi nous choisir ?",
    items: [
      {
        title: "Expérience Confirmée",
        body: "Plus de 10 ans à accompagner des marques de tous secteurs..",
      },
      {
        title: "Résultats Concrets",
        body: "Nous ne vendons pas du rêve, mais des chiffres et de la croissance.",
      },
      {
        title: "Accompagnement Global",
        body: "De la stratégie à l'exécution, nous sommes à vos côtés.",
      },
    ],
  },
};

export const servicesPage = {
  title: "Nos services",
  lead: "Une offre complète pour développer votre marque en ligne. Chaque service est pensé pour générer des résultats concrets.",
};

export const contactPage = {
  title: "Contact",
  lead: "Une question ? Un projet en tête ? Contactez-nous et recevez une réponse rapide.",
  info: [
    { label: "Email", value: "contact@leegigroup.com", href: "mailto:contact@leegigroup.com" },
    { label: "Téléphone", value: "221 78 122 93 05", href: "tel:+221781229305" },
    { label: "Adresse", value: "Dakar, Sénégal", href: null },
    { label: "Horaires", value: "Lun-Ven, 9h-18h", href: null },
  ],
  jsNote: "Veuillez activer JavaScript dans votre navigateur pour remplir ce formulaire.",
  submit: "Envoyer le message",
  formTitle: "Écrivez-nous",
  formBody: "Remplissez le formulaire ci-dessous et nous vous répondrons dans les meilleurs délais.",
  formPoints: [
    "Réponse rapide sous 48h",
    "Un interlocuteur à votre écoute",
    "Devis gratuit et sans engagement",
  ],
  locationTitle: "Nous trouver à Dakar, Sénégal",
  locationBody: "Venez nous rendre visite du lundi au vendredi, 9h-18h.",
};

export const devisPage = {
  title: "Parlez-nous de votre projet",
  lead: "Recevez une proposition adaptée à vos objectifs.",
  jsNote: "Veuillez activer JavaScript dans votre navigateur pour remplir ce formulaire.",
  servicePlaceholder: "Sélectionnez un service",
  serviceOptions: [
    "Branding",
    "Site Web",
    "SEO",
    "Contenu, Réel & Spot",
    "Evènementiel",
    "Communication & Marketing",
  ],
  submit: "Recevoir mon devis",
  formTitle: "Votre projet en quelques champs",
  formBody: "Plus vos informations sont précises, plus notre proposition sera adaptée.",
  includeTitle: "Ce que nous includons",
  includes: [
    "Une réponse sous 48h ouvrées",
    "Une proposition sur-mesure et chiffrée",
    "Un échange découverte offert",
    "Un interlocuteur unique du devis à la livraison",
  ],
};

export const finalCta = {
  title: "Prêt à rendre votre marque incontournable ?",
  body: "Contactez-nous pour discuter de votre projet et recevoir une proposition personnalisée.",
  primary: "Demander un devis",
  secondary: "Nous contacter",
};

export const clients = [
  "EMF Consulting",
  "Comprint",
  "SENTRAS",
  "Houda Ingénierie",
  "Setna Services",
  "ESCDA",
];

export const ui = {
  viewDetails: "Voir les détails",
  discover: "Découvrir",
  learnMore: "En savoir plus sur nous",
  viewAllProjects: "Voir toutes nos réalisations",
  viewAllServices: "Voir tous les services",
  discussProject: "Discutons de votre projet",
  presentation: "Présentation",
  ourOffer: "Notre offre",
  portfolio: "Portfolio",
  references: "Références",
  testimonialTitle: "Nos Témoignage",
  testimonialBody: "Découvrez ce que nos clients disent de leur collaboration avec LEGI Groupe.",
  clientsTitle: "Nos Clients",
  clientsLink: "Découvrez les projets de nos clients",
  methodology: "Méthode",
  expertise: "Expertise",
  agency: "Agence de communication digitale — Dakar",
  freeQuote: "Devis gratuit",
  talkToUs: "Parlons-nous",
  teamEyebrow: "Notre Équipe",
  whatDrivesUs: "Ce qui nous anime",
  ourStrengths: "Nos atouts",
  top: "Haut",
  bottom: "Bas",
  footerQuickLinks: "Liens rapide",
  footerService: "Service",
  rights: "Tous droits réservés.",
  notFoundTitle: "Oups ! Cette page est introuvable.",
  notFoundBody: "On dirait que rien n'a été trouvé à cet endroit. Retournez à l'accueil pour poursuivre votre navigation.",
  backHome: "Retour à l'accueil",
  languageLabel: "Langue",
  searchLabel: "Rechercher sur le site",
  searchPlaceholder: "Rechercher un service, une réalisation…",
  searchNoResults: "Aucun résultat",
};

const dictionary = {
  site, nav, services, hero, stats, about, projects, filters,
  testimonials, aboutPage, servicesPage, contactPage, devisPage, finalCta, clients, ui,
};

export default dictionary;
