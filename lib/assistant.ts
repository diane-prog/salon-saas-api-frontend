import { localePath, type Dictionary, type Locale } from "@/lib/dictionaries";

/**
 * Réponses PRÉDÉFINIES de l'assistant — la couche qui ne dépend d'AUCUN modèle.
 *
 * Pourquoi elle existe : un assistant de site répond quatre fois sur cinq à la même poignée de
 * questions (services, prix, délais, contact, devis). Les faire passer par un modèle, c'est
 * payer une latence et un coût pour une phrase qu'on connaît déjà — et perdre la réponse
 * entière quand la clé manque, que le quota est atteint ou que le fournisseur est en panne.
 * Ici, ces questions reçoivent une réponse INSTANTANÉE, exacte (elle vient du dictionnaire du
 * site) et gratuite ; le modèle ne sert plus qu'aux questions ouvertes, celles pour lesquelles
 * il apporte vraiment quelque chose.
 *
 * Reconnaissance : les mots-clés sont normalisés (minuscules, sans accents) et comparés au
 * texte de la question, en français COMME en anglais — un visiteur n'écrit pas toujours dans
 * la langue de la page. Le score est le nombre de mots-clés touchés ; il faut atteindre le
 * seuil de l'intention. En dessous, on laisse la main au modèle : mieux vaut « je ne sais pas »
 * que de répondre à côté.
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

function listServices({ dict }: AssistantContext): string {
  return dict.services.map((service) => service.title).join(" · ");
}

type Intent = {
  id: string;
  /** Mots-clés : cherchés en SOUS-CHAÎNE dans la question normalisée. */
  keywords: string[];
  /** Nombre de touches nécessaires (1 par défaut : une question courte ne dit qu'un mot). */
  minHits?: number;
  answer: (context: AssistantContext) => string;
};

const INTENTS: Intent[] = [
  {
    id: "salutation",
    keywords: ["bonjour", "bonsoir", "salut", "hello", "hi ", "hey", "coucou", "good morning"],
    answer: ({ locale }) =>
      locale === "fr"
        ? "Bonjour ! Dites-moi ce qu'il vous faut : un service en particulier, un ordre de budget, un délai, ou simplement comment nous joindre. Je peux aussi vous emmener directement au devis."
        : "Hello! Tell me what you need: a specific service, a budget range, a deadline, or simply how to reach us. I can also take you straight to the quote form.",
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
        ? `Le tarif dépend de trois choses : le périmètre (nombre de pages ou de contenus), le niveau de conception, et le rythme de production. C'est pour ça que nous ne donnons pas de prix au hasard : demandez un devis gratuit (${localePath(locale, "/devis")}), vous recevez une proposition chiffrée sous 48 h ouvrées — sans engagement.`
        : `Pricing depends on three things: scope (how many pages or deliverables), the level of design work, and the production pace. That's why we don't guess: request a free quote (${localePath(locale, "/devis")}) and you get a costed proposal within 48 business hours — no commitment.`,
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
        ? `Nous couvrons ${listServices({ dict, locale })}. Dites-moi lequel vous intéresse, je vous explique ce qu'il comprend — et si vous ne savez pas encore, je vous oriente selon votre objectif.`
        : `We cover ${listServices({ dict, locale })}. Tell me which one interests you and I'll explain what it includes — and if you're not sure yet, I'll point you to the right one for your goal.`,
  },
  {
    id: "devis",
    keywords: ["devis", "quote", "estimation", "proposition", "proposal"],
    answer: ({ locale }) =>
      locale === "fr"
        ? `Le plus simple : le formulaire de devis (page ${localePath(locale, "/devis")}, ou le bouton « Demander un devis » en bas de l'écran — il l'ouvre sans quitter la page). Il faut votre nom, votre e-mail, le service souhaité et deux lignes sur le projet ; nous répondons sous 48 h ouvrées.`
        : `Easiest path: the quote form (${localePath(locale, "/devis")}, or the “Get a quote” button at the bottom of the screen — it opens right where you are). We need your name, email, the service you want and two lines about the project; we reply within 48 business hours.`,
  },
  {
    id: "delai",
    keywords: ["delai", "temps", "duree", "rapide", "combien de temps", "deadline", "how long", "timeline"],
    answer: ({ locale }) =>
      locale === "fr"
        ? "Comptez 48 h ouvrées pour la réponse au devis, puis le calendrier dépend du projet : un site vitrine bien mené se compte en semaines, pas en mois. Donnez-nous votre échéance dans le formulaire, nous construisons le planning autour."
        : "Allow 48 business hours for the quote reply; after that the schedule depends on the project: a well-run showcase site is a matter of weeks, not months. Give us your deadline in the form and we build the plan around it.",
  },
  {
    id: "contact",
    keywords: ["contact", "contacter", "telephone", "tel", "email", "mail", "numero", "joindre", "appeler", "phone", "reach", "call"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Directement : ${dict.site.email}, ${dict.site.phone} ou WhatsApp (https://wa.me/${dict.site.phoneRaw.replace(/[^\d]/g, "")}). Nous sommes à ${dict.site.address}, ${dict.site.hours}.`
        : `Directly: ${dict.site.email}, ${dict.site.phone} or WhatsApp (https://wa.me/${dict.site.phoneRaw.replace(/[^\d]/g, "")}). We're in ${dict.site.address}, ${dict.site.hours}.`,
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
        ? `Nous sommes à ${dict.site.address}. ${dict.site.hours} — et si vous préférez, tout se fait à distance : visio, e-mail, WhatsApp.`
        : `We're in ${dict.site.address}. ${dict.site.hours} — and if you prefer, everything can be done remotely: video call, email, WhatsApp.`,
  },
  {
    id: "realisations",
    keywords: ["realisation", "realisations", "portfolio", "projet", "projets", "reference", "references", "exemple", "case", "work", "clients"],
    answer: ({ locale }) =>
      locale === "fr"
        ? `Nos projets sont sur la page Réalisations (${localePath(locale, "/realisations")}), et les clients qui nous font confiance sont sur l'accueil. Dites-moi votre secteur, je vous indique ce qui s'en rapproche le plus.`
        : `Our projects are on the Projects page (${localePath(locale, "/realisations")}), and the clients who trust us are on the home page. Tell me your industry and I'll point you to the closest fit.`,
  },
  {
    id: "agence",
    keywords: ["qui etes", "qui etes vous", "agence", "presentation", "apropos", "a propos", "about", "who are you", "company"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `${dict.site.name} — ${dict.site.tagline}, basée à ${dict.site.address}. Nous travaillons l'identité, le web, le SEO, les contenus, l'événementiel et la stratégie, avec un interlocuteur unique du devis à la livraison.`
        : `${dict.site.name} — ${dict.site.tagline}, based in ${dict.site.address}. We work on brand identity, web, SEO, content, events and strategy, with a single point of contact from quote to delivery.`,
  },
  {
    id: "merci",
    keywords: ["merci", "thanks", "thank you", "parfait", "nickel", "super"],
    answer: ({ dict, locale }) =>
      locale === "fr"
        ? `Avec plaisir. Si vous voulez avancer, le devis gratuit est à un clic (bouton « Demander un devis » en bas), sinon écrivez-nous à ${dict.site.email}.`
        : `My pleasure. If you want to move forward, the free quote is one click away (the “Get a quote” button at the bottom), otherwise write to us at ${dict.site.email}.`,
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
    if (hits < (intent.minHits ?? 1)) continue;
    /* À égalité, la première intention garde l'avantage : la liste est écrite du plus
       fréquent au plus rare, et « devis » doit rester prioritaire sur « contact ». */
    if (!best || hits > best.hits) best = { intent, hits };
  }

  return best ? { id: best.intent.id, text: best.intent.answer(context) } : null;
}

/**
 * Réponse de repli quand aucune intention ne colle ET qu'aucun modèle n'est configuré : on ne
 * laisse jamais le visiteur sans porte de sortie. Elle dit ce qu'on peut répondre ici, puis
 * donne les deux canaux directs.
 */
export function handoffAnswer({ dict, locale }: AssistantContext): string {
  const whatsapp = `https://wa.me/${dict.site.phoneRaw.replace(/[^\d]/g, "")}`;
  return locale === "fr"
    ? `Je n'ai pas de réponse fiable à ça. ` +
        `Je peux vous renseigner sur nos services (${listServices({ dict, locale })}), nos délais, nos budgets ou nos coordonnées — ` +
        `et pour le reste, l'équipe répond directement : ${dict.site.email} ou WhatsApp (${whatsapp}). ` +
        `Vous pouvez aussi demander un devis gratuit : ${localePath(locale, "/devis")}.`
    : `I don't have a reliable answer to that. ` +
        `I can help with our services (${listServices({ dict, locale })}), timelines, budget ranges or contact details — ` +
        `and for anything else the team answers directly: ${dict.site.email} or WhatsApp (${whatsapp}). ` +
        `You can also request a free quote: ${localePath(locale, "/devis")}.`;
}
