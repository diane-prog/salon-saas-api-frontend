import { localePath, type Dictionary, type Locale } from "@/lib/dictionaries";

/**
 * Réponses PRÉDÉFINIES de l'assistant — la couche qui ne dépend d'AUCUN modèle.
 *
 * Pourquoi elle existe : un assistant de site répond quatre fois sur cinq à la même poignée de
 * questions (services, prix, délais, contact, devis). Les faire passer par un modèle, c'est
 * payer une latence et un coût pour une phrase qu'on connaît déjà — et perdre la réponse
 * entière quand la clé manque, que le quota est atteint ou que le fournisseur est en panne.
 * Ici, ces questions reçoivent une réponse INSTANTANÉE, exacte (elle vient du dictionnaire du
 * site) et gratuite ; le modèle ne sert plus qu'aux questions ouvertes.
 *
 * MISE EN FORME : les réponses sont écrites comme on parle à un client, pas comme on écrit
 * dans un navigateur. Deux règles, tenues partout :
 *
 * 1. UNE ADRESSE NE S'AFFICHE JAMAIS TELLE QUELLE. « la page /fr/contact » ne veut rien dire
 *    pour un visiteur : il ne sait pas ce qu'est `/fr`, et un chemin brut fait bricolage. Une
 *    page se nomme — « la page Contact » — et, quand le lien est utile, il s'écrit `[Contact]
 *    (/fr/contact)` : le client lit un mot, le lien porte l'adresse. Même chose pour WhatsApp,
 *    qui s'affiche par son nom et non par son `wa.me` ;
 * 2. on aère. Une idée par paragraphe, et une liste à puces (`- `) dès qu'il y a une
 *    énumération. C'est la fenêtre de chat qui met en forme (paragraphes, puces, gras, liens) —
 *    voir `components/Chatbot.tsx` ;
 * 3. rien n'est promis qui n'existe pas : les tarifs et les délais ne sont jamais inventés.
 *
 * Reconnaissance : les mots-clés sont normalisés (minuscules, sans accents) et comparés au
 * texte de la question, en français COMME en anglais — un visiteur n'écrit pas toujours dans
 * la langue de la page. Le score est le nombre de mots-clés touchés ; il faut atteindre le
 * seuil de l'intention. En dessous, la main passe au modèle (ou, sans modèle, à l'équipe).
 */

export type AssistantContext = { dict: Dictionary; locale: Locale };

/** Minuscules, sans accents, apostrophes unifiées : « Coût » et « cout » se rencontrent. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .toLowerCase();
}

/** Les services en liste à puces — la forme sous laquelle on les lit vraiment. */
function serviceList(locale: Locale, dict: Dictionary): string {
  return dict.services.map((service) => `- ${service.title}`).join("\n");
}

type Intent = {
  id: string;
  /** Mots-clés : cherchés en SOUS-CHAÎNE dans la question normalisée. */
  keywords: string[];
  answer: (context: AssistantContext) => string;
};

const INTENTS: Intent[] = [
  {
    id: "salutation",
    keywords: ["bonjour", "bonsoir", "salut", "hello", "hi ", "hey", "coucou", "good morning"],
    answer: ({ locale }) =>
      locale === "fr"
        ? "Bonjour ! Dites-moi ce qu'il vous faut :\n\n- un service en particulier\n- un ordre de budget\n- un délai\n- ou simplement comment nous joindre\n\nJe peux aussi vous donner les coordonnées de l'équipe."
        : "Hello! Tell me what you need:\n\n- a specific service\n- a budget range\n- a deadline\n- or simply how to reach us\n\nI can also give you the team's contact details.",
  },
  /* Le PRIX est placé avant les SERVICES, et ce n'est pas un détail d'ordre : « Combien coûte
     un site web ? » touche les deux intentions (mot-clé « coute » et mot-clé « site web »), et
     à égalité de touches c'est la première qui répond. Or c'est bien le budget qu'on demande,
     pas la liste des services. */
  {
    id: "prix",
    keywords: ["prix", "coute", "cout", "tarif", "budget", "devis combien", "price", "cost", "how much", "pricing"],
    answer: ({ locale }) =>
      locale === "fr"
        ? `Le tarif dépend de trois choses : le périmètre (nombre de pages ou de contenus), le niveau de conception, et le rythme de production.\n\nC'est pour ça que nous ne donnons pas de prix au hasard : écrivez-nous : la page [Contact](${localePath(locale, "/contact")}) rassemble le courriel et le téléphone. Vous recevez une proposition chiffrée sous 48 h ouvrées, sans engagement.`
        : `Pricing depends on three things: scope (how many pages or deliverables), the level of design work, and the production pace.\n\nThat's why we don't guess: write to us: the [Contact](${localePath(locale, "/contact")}) page gathers our email and phone. You get a costed proposal within 48 business hours, no commitment.`,
  },
  {
    id: "devis",
    keywords: ["devis", "quote", "estimation", "proposition", "proposal"],
    answer: ({ locale }) =>
      locale === "fr"
        ? `Le plus simple : écrivez-nous — la page [Contact](${localePath(locale, "/contact")}) rassemble nos coordonnées.\n\nIl nous faut :\n\n- votre nom et votre e-mail\n- le service souhaité\n- deux lignes sur le projet\n\nNous répondons sous 48 h ouvrées.`
        : `Easiest path: write to us — the [Contact](${localePath(locale, "/contact")}) page gathers our details.\n\nWe need:\n\n- your name and email\n- the service you're after\n- two lines about the project\n\nWe reply within 48 business hours.`,
  },
  {
    id: "services",
    keywords: [
      "service",
      "services",
      "prestation",
      "offre",
      "expertise",
      "que faites",
      "site web",
      "site internet",
      "refonte",
      "what do you do",
      "offer",
    ],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Nous couvrons ${dict.services.length} métiers :\n\n${serviceList(locale, dict)}\n\nDites-moi lequel vous intéresse, je vous explique ce qu'il comprend — et si vous ne savez pas encore, je vous oriente selon votre objectif.`
        : `We cover ${dict.services.length} areas:\n\n${serviceList(locale, dict)}\n\nTell me which one interests you and I'll explain what it includes — and if you're not sure yet, I'll point you to the right one for your goal.`,
  },
  {
    id: "delai",
    keywords: ["delai", "temps", "duree", "rapide", "combien de temps", "deadline", "how long", "timeline"],
    answer: ({ locale }) =>
      locale === "fr"
        ? "Comptez 48 h ouvrées pour la réponse au devis. Ensuite, le calendrier dépend du projet : un site vitrine bien mené se compte en semaines, pas en mois.\n\nDonnez-nous votre échéance dans le formulaire, nous construisons le planning autour."
        : "Allow 48 business hours for the quote reply. After that the schedule depends on the project: a well-run showcase site is a matter of weeks, not months.\n\nGive us your deadline in the form and we build the plan around it.",
  },
  {
    id: "contact",
    keywords: ["contact", "contacter", "telephone", "tel", "email", "mail", "numero", "joindre", "appeler", "phone", "reach", "call"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Trois façons de nous joindre :\n\n- par e-mail : **${dict.site.email}**\n- par téléphone : **${dict.site.phone}**\n- sur [WhatsApp](${dict.site.whatsapp})\n\nNous sommes à ${dict.site.address}, ${dict.site.hours.toLowerCase()}.`
        : `Three ways to reach us:\n\n- email: **${dict.site.email}**\n- phone: **${dict.site.phone}**\n- or [WhatsApp](${dict.site.whatsapp})\n\nWe're in ${dict.site.address}, ${dict.site.hours.toLowerCase()}.`,
  },
  {
    id: "adresse",
    keywords: [
      "adresse",
      "etes",
      "se trouve",
      "localisation",
      "emplacement",
      "bureau",
      "ville",
      "pays",
      "dakar",
      "senegal",
      "address",
      "where",
      "located",
      "location",
      "office",
      "based",
    ],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Nous sommes à ${dict.site.address} (${dict.site.hours.toLowerCase()}).\n\nEt si vous préférez, tout se fait à distance : visio, e-mail, WhatsApp.`
        : `We're in ${dict.site.address} (${dict.site.hours.toLowerCase()}).\n\nAnd if you prefer, everything can be done remotely: video call, email, WhatsApp.`,
  },
  {
    id: "realisations",
    keywords: ["realisation", "realisations", "portfolio", "projet", "projets", "reference", "references", "exemple", "case", "work", "clients"],
    answer: ({ locale }) =>
      locale === "fr"
        ? `Nos projets sont sur la page [Réalisations](${localePath(locale, "/realisations")}), et les clients qui nous font confiance sont sur l'accueil.\n\nDites-moi votre secteur, je vous indique ce qui s'en rapproche le plus.`
        : `Our projects are on the [Projects](${localePath(locale, "/realisations")}) page, and the clients who trust us are on the home page.\n\nTell me your industry and I'll point you to the closest fit.`,
  },
  {
    id: "agence",
    keywords: ["qui etes", "qui etes vous", "agence", "presentation", "apropos", "a propos", "about", "who are you", "company"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `**${dict.site.name}** — ${dict.site.tagline}, basée à ${dict.site.address}.\n\nNous couvrons ${dict.services.length} métiers, de l'identité au web, avec un interlocuteur unique du premier échange à la livraison.`
        : `**${dict.site.name}** — ${dict.site.tagline}, based in ${dict.site.address}.\n\nWe cover ${dict.services.length} areas, from brand identity to web, with a single point of contact from first contact to delivery.`,
  },
  {
    id: "merci",
    keywords: ["merci", "thanks", "thank you", "parfait", "nickel", "super"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Avec plaisir.\n\nPour avancer, écrivez-nous à **${dict.site.email}** ou appelez le **${dict.site.phone}** : c'est nous qui répondons.`
        : `My pleasure.\n\nTo move forward, write to us at **${dict.site.email}** or call **${dict.site.phone}** — we answer ourselves.`,
  },
];

export type PredefinedAnswer = { id: string; text: string };

/**
 * Cherche une réponse prédéfinie. Retourne `null` quand la question est trop ouverte : c'est
 * au modèle de la traiter (ou, sans modèle, de passer la main à l'équipe).
 */
export function predefinedAnswer(input: string, context: AssistantContext): PredefinedAnswer | null {
  const question = normalize(input);
  if (!question.trim()) return null;

  let best: { intent: Intent; hits: number } | null = null;
  for (const intent of INTENTS) {
    const hits = intent.keywords.reduce(
      (total, keyword) => (question.includes(normalize(keyword)) ? total + 1 : total),
      0,
    );
    if (hits === 0) continue;
    /* À égalité, la première intention garde l'avantage : la liste est écrite du plus
       fréquent au plus spécifique, et c'est ce qui fait répondre le BUDGET plutôt que la liste
       des services à « Combien coûte un site web ? ». */
    if (!best || hits > best.hits) best = { intent, hits };
  }

  return best ? { id: best.intent.id, text: best.intent.answer(context) } : null;
}

/**
 * Réponse de repli quand aucune intention ne colle ET qu'aucun modèle n'est configuré : on ne
 * laisse jamais le visiteur sans porte de sortie. Elle dit ce qu'on peut répondre ici, puis
 * donne les canaux directs — nommés, jamais en URL brute.
 */
export function handoffAnswer({ dict, locale }: AssistantContext): string {
  return locale === "fr"
    ? `Je n'ai pas de réponse fiable à ça.\n\nCe que je peux traiter tout de suite :\n\n- nos services\n- nos délais et nos budgets\n- nos coordonnées\n\nPour le reste, l'équipe répond directement : **${dict.site.email}**, par téléphone au **${dict.site.phone}**, ou sur [WhatsApp](${dict.site.whatsapp}).`
    : `I don't have a reliable answer to that.\n\nWhat I can handle right away:\n\n- our services\n- our timelines and budgets\n- our contact details\n\nFor anything else the team answers directly: **${dict.site.email}**, by phone on **${dict.site.phone}**, or on [WhatsApp](${dict.site.whatsapp}).`;
}
