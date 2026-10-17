import { type NextRequest, NextResponse } from "next/server";

/**
 * Proxy same-origin vers l'API Salon SaaS.
 *
 * MESURÉ LE 2026-10-16, et c'est toute sa raison d'être : le backend ne renvoie
 * **aucun `Access-Control-Allow-Origin`**, ni sur le preflight (`OPTIONS`) ni sur
 * les réponses réelles, quelle que soit l'origine présentée. Il envoie bien
 * `access-control-allow-credentials: true`, une liste d'en-têtes autorisés, et
 * `vary: Origin` — mais jamais l'origine elle-même. Le navigateur bloque donc
 * l'appel, et axios le présente comme un « Network Error » sans corps lisible.
 *
 * En relayant par `/api/backend/**`, la requête part de notre propre origine :
 * plus de preflight, plus de blocage, et `Authorization` transite par notre
 * domaine. Le client HTTP (`lib/axios-config.ts`) garde exactement la même
 * logique — seule sa base change côté navigateur.
 *
 * À supprimer le jour où le backend autorisera nos origines (voir le commentaire
 * dans `lib/axios-config.ts`) : cette route n'a aucune autre raison d'exister.
 */

/** Base absolue de l'API, avec son suffixe `/api/v1`. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** En-têtes transmis à l'API. */
const FORWARD_REQUEST_HEADERS = ["authorization", "content-type", "accept"];

/** En-têtes de réponse relayés au client (pagination comprise). */
const FORWARD_RESPONSE_HEADERS = ["content-type", "x-total-count"];

/** Au-delà, on renvoie 504 plutôt que de laisser la requête pendre. */
const UPSTREAM_TIMEOUT_MS = 30_000;

type Handler = (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => Promise<NextResponse>;

const proxy = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> => {
  const { path } = await context.params;

  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        statusCode: 500,
        error:
          "NEXT_PUBLIC_API_BASE_URL manquante : renseignez-la dans .env.local puis relancez le serveur.",
      },
      { status: 500 },
    );
  }

  const target = `${API_BASE_URL}/${path.join("/")}${request.nextUrl.search}`;

  /* Corps lu en binaire : les mêmes routes servent le JSON **et** l'upload
     multipart de la galerie. */
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
      /* Requis par Node pour diffuser un corps sans le mettre en tampon. */
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    const payload = await upstream.arrayBuffer();

    const responseHeaders = new Headers();
    for (const name of FORWARD_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new NextResponse(payload, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";

    return NextResponse.json(
      {
        statusCode: aborted ? 504 : 502,
        error: aborted
          ? "Le serveur a mis trop de temps à répondre."
          : "Impossible de joindre le serveur.",
      },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const GET = proxy as Handler;
export const POST = proxy as Handler;
export const PUT = proxy as Handler;
export const PATCH = proxy as Handler;
export const DELETE = proxy as Handler;
