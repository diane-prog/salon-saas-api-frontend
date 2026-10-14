import { getDictionary, isLocale, type Dictionary } from "@/lib/dictionaries";
import { handoffAnswer, predefinedAnswer } from "@/lib/assistant";

/**
 * Assistant conversationnel du site.
 *
 * Ce qu'il fait : il répond aux visiteurs en FLUX CONTINU (on lit la réponse pendant qu'elle
 * s'écrit, on ne fixe pas un écran d'attente), dans la langue de la page, et avec une seule
 * source de vérité — le dictionnaire du site. Les services, les coordonnées, l'adresse et les
 * horaires sont donc exactement ceux affichés sur les pages : l'assistant ne peut pas
 * « inventer » une offre qui n'existe pas, et quand on lui demande un prix, il renvoie au
 * devis au lieu de le fabriquer.
 *
 * Ce qu'il refuse : que le client dicte les instructions du modèle. Le prompt système est
 * construit ici, jamais reçu du navigateur ; seuls des tours `user`/`assistant` sont lus, et
 * l'historique est borné (nombre de tours ET longueur des messages).
 *
 * DEUX ÉTAGES, dans cet ordre :
 * 1. les réponses PRÉDÉFINIES (`lib/assistant.ts`) — services, prix, délais, contact, devis,
 *    réalisations… Réponse immédiate, exacte (elle vient du dictionnaire), gratuite, et qui
 *    fonctionne SANS clé ni fournisseur ;
 * 2. le modèle, pour les questions ouvertes uniquement. S'il n'est pas configuré — ou si
 *    l'appel échoue — on ne renvoie pas une erreur : on répond ce qu'on sait et on donne les
 *    coordonnées de l'équipe. Le visiteur n'a jamais de mur.
 *
 * FOURNISSEUR : le premier configuré gagne, tous parlent la même API (structure OpenAI), donc
 * le code d'appel est unique et le choix se fait dans `.env.local`, pas dans le code :
 *   1. Mistral (`MISTRAL_API_KEY`) — palier GRATUIT « Free mode » de La Plateforme, et son API
 *      Chat Completions suit exactement la structure d'OpenAI (`api.mistral.ai/v1`) ;
 *   2. passerelle OpenLLM (`OPENLLM_API_KEY` + `OPENLLM_ENDPOINT`) ;
 *   3. OpenAI en direct (`OPENAI_API_KEY`).
 * `CHAT_MODEL` surcharge le modèle : le bon rapport qualité/prix bouge plus vite que ce site.
 *
 * Seule une requête MAL FORMÉE (aucun tour, ou rien qui vienne du visiteur) est refusée en
 * 400 : le reste du temps, la route finit toujours par une réponse utile.
 */

/** Nombre de tours gardés ET longueur maximale d'un message : borne le coût d'un appel. */
const MAX_TURNS = 12;
const MAX_CHARS = 1500;

type Turn = { role: "user" | "assistant"; content: string };
type Provider = { endpoint: string; key: string; model: string };

/** Le fournisseur configuré, ou `null` (la route le dit alors explicitement). */
function provider(): Provider | null {
  const model = process.env.CHAT_MODEL;

  /* Mistral en premier : c'est le seul à offrir un palier gratuit, et `mistral-small-latest`
     suffit largement pour répondre sur des services et des coordonnées. */
  if (process.env.MISTRAL_API_KEY) {
    const base = process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1";
    return {
      endpoint: `${base.replace(/\/+$/, "")}/chat/completions`,
      key: process.env.MISTRAL_API_KEY,
      model: model ?? "mistral-small-latest",
    };
  }

  const key = process.env.OPENLLM_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!key) return null;
  const base =
    process.env.OPENLLM_ENDPOINT ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  return {
    endpoint: `${base.replace(/\/+$/, "")}/chat/completions`,
    key,
    model: model ?? "gpt-4o-mini",
  };
}

function isTurn(value: unknown): value is Turn {
  if (!value || typeof value !== "object") return false;
  const turn = value as { role?: unknown; content?: unknown };
  return (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string";
}

/**
 * Le prompt système. Court, factuel, et surtout : construit à partir du dictionnaire. Le ton
 * est celui du site — direct, sans superlatif — et l'assistant a une seule mission de
 * conversion : finir sur le devis, l'email ou WhatsApp.
 */
function buildSystem(locale: "fr" | "en", dict: Dictionary): string {
  const services = dict.services.map((s) => `- ${s.title} : ${s.short}`).join("\n");
  const whatsapp = `https://wa.me/${dict.site.phoneRaw.replace(/[^\d]/g, "")}`;
  const facts = [
    `Nom : ${dict.site.name}`,
    `Présentation : ${dict.site.tagline}`,
    `Adresse : ${dict.site.address}`,
    `Horaires : ${dict.site.hours}`,
    `Email : ${dict.site.email}`,
    `Téléphone : ${dict.site.phone}`,
    `WhatsApp : ${whatsapp}`,
    `Page de devis : /${locale}/devis`,
    `Services :\n${services}`,
  ].join("\n");

  const rules =
    locale === "fr"
      ? [
          "Tu réponds en français, en 2 à 4 phrases, ton direct et professionnel, sans emoji sauf si le visiteur en utilise.",
          "Tu ne connais que les informations ci-dessous : pour tout le reste, tu dis que l'équipe confirme (email ou WhatsApp) plutôt que d'improviser.",
          "Tu ne donnes JAMAIS de prix ferme ni de délai garanti : tu expliques ce qui fait varier le tarif, puis tu invites à demander un devis gratuit.",
          "Quand le visiteur est prêt, tu proposes le devis (/fr/devis), l'email ou WhatsApp.",
        ]
      : [
          "Answer in English, 2 to 4 sentences, direct and professional, no emoji unless the visitor uses some.",
          "You only know the information below: for anything else, say the team will confirm (email or WhatsApp) instead of guessing.",
          "Never give a firm price or guaranteed timeline: explain what drives the cost, then invite them to request a free quote.",
          "When the visitor is ready, offer the quote page (/en/devis), email, or WhatsApp.",
        ];

  return [
    locale === "fr"
      ? `Tu es l'assistant de ${dict.site.name}, agence de communication digitale à Dakar. Tu réponds aux visiteurs du site.`
      : `You are the assistant of ${dict.site.name}, a digital communication agency in Dakar. You answer visitors on the website.`,
    rules.join("\n"),
    `Informations de référence :\n${facts}`,
  ].join("\n\n");
}

/**
 * Transforme le flux SSE du fournisseur en TEXTE BRUT.
 *
 * Pourquoi côté serveur : le client n'a alors qu'à lire un flux de texte, sans analyser du
 * SSE ni gérer les morceaux coupés au milieu d'une ligne JSON. Le découpage se fait ici, où
 * `buffer` garde la ligne incomplète d'un paquet à l'autre.
 */
function sseToText(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });

      /* On garde le dernier fragment : il peut être une ligne JSON tronquée. */
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const chunk = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* Fragment illisible : on l'ignore, le flux continue. */
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}

/** Le texte arrive au client comme un flux, même quand il tient en une phrase : le client
    n'a ainsi qu'un seul cas à lire, et la réponse s'affiche dès qu'elle est prête. */
function textStream(text: string): Response {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let body: { messages?: unknown; locale?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown; locale?: unknown };
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "fr";
  if (!Array.isArray(body.messages)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const history: Turn[] = body.messages
    .filter(isTurn)
    .slice(-MAX_TURNS)
    .map((turn) => ({ role: turn.role, content: turn.content.slice(0, MAX_CHARS) }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const dict = await getDictionary(locale);
  const context = { dict, locale };

  /* ÉTAGE 1 — la question est déjà connue : on répond sans appeler personne. */
  const question = history[history.length - 1].content;
  const predefined = predefinedAnswer(question, context);
  if (predefined) return textStream(predefined.text);

  /* ÉTAGE 2 — question ouverte : le modèle, s'il est configuré. Sinon, on passe la main à
     l'équipe plutôt que de laisser le visiteur devant une panne. */
  const upstream = provider();
  if (!upstream) return textStream(handoffAnswer(context));

  let response: Response;
  try {
    response = await fetch(upstream.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstream.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: upstream.model,
        stream: true,
        /* `temperature` basse : c'est un assistant commercial, pas un conteur — on veut des
           réponses stables et factuelles. */
        temperature: 0.3,
        messages: [{ role: "system", content: buildSystem(locale, dict) }, ...history],
      }),
    });
  } catch {
    return textStream(handoffAnswer(context));
  }

  if (!response.ok || !response.body) {
    return textStream(handoffAnswer(context));
  }

  return new Response(sseToText(response.body), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      /* Pas de mise en tampon : la réponse doit s'écrire à l'écran au fil de l'eau. */
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
