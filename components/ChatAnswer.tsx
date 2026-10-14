import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Mise en forme des réponses de l'assistant.
 *
 * Pourquoi un rendu et pas du texte brut : une réponse écrite d'un bloc, avec des chemins
 * collés dedans, se lit comme une sortie de terminal. Le client, lui, doit lire une réponse de
 * commercial — des phrases courtes, des puces quand il y a une liste, et des LIENS NOMMÉS.
 *
 * Le sous-ensemble accepté est volontairement minuscule, et c'est un choix de sécurité : on ne
 * rend que ce qu'on comprend, jamais de HTML. Il couvre exactement ce que produisent les
 * réponses prédéfinies (`lib/assistant.ts`) et ce que le prompt système demande au modèle :
 *
 * - `**gras**` → mis en valeur ;
 * - `[Libellé](/fr/page)` → lien interne (navigation Next, sans rechargement) ;
 * - `[Libellé](https://…)` → lien externe (WhatsApp, réseaux) ;
 * - une ligne commençant par `- ` ou `•` → puce ; plusieurs à la suite → une liste ;
 * - une ligne vide → nouveau paragraphe ; un simple retour → saut de ligne.
 *
 * Une adresse collée toute seule (`https://wa.me/…`) reste cliquable, mais s'affiche SANS son
 * protocole : c'est le dernier filet, pour un modèle qui n'aurait pas suivi la consigne.
 */

/** Découpe le texte en blocs (paragraphes), puis chaque bloc en segments (paragraphe/liste). */
function blocks(text: string): { list: boolean; lines: string[] }[][] {
  return text
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .reduce<{ list: boolean; lines: string[] }[]>((segments, line) => {
          const list = /^\s*[-•]\s+/.test(line);
          const last = segments[segments.length - 1];
          if (last && last.list === list) last.lines.push(line);
          else segments.push({ list, lines: [line] });
          return segments;
        }, []),
    )
    .filter((segments) => segments.length > 0);
}

/** Motif des éléments « riches » : gras, lien nommé, adresse nue. */
const RICH = /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s)]+)/g;

const linkClass =
  "text-turquoise underline decoration-turquoise/50 underline-offset-4 transition-colors hover:decoration-turquoise";

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(RICH).map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (/^\*\*[^*\n]+\*\*$/.test(part)) {
      return (
        <strong key={key} className="font-medium text-paper">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const named = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/.exec(part);
    if (named) {
      const [, label, href] = named;
      return href.startsWith("/") ? (
        <Link key={key} href={href as never} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a key={key} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      );
    }

    return part;
  });
}

export default function ChatAnswer({ text }: { text: string }) {
  return (
    <>
      {blocks(text).map((segments, blockIndex) => (
        <div key={blockIndex} className="mt-3 first:mt-0">
          {segments.map((segment, segmentIndex) =>
            segment.list ? (
              <ul key={segmentIndex} className="grid gap-1.5">
                {segment.lines.map((line, lineIndex) => (
                  <li key={lineIndex} className="flex gap-2.5">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-turquoise" aria-hidden />
                    <span>{inline(line.replace(/^\s*[-•]\s+/, ""), `${blockIndex}-${segmentIndex}-${lineIndex}`)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p key={segmentIndex}>
                {segment.lines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {inline(line, `${blockIndex}-${segmentIndex}-${lineIndex}`)}
                  </Fragment>
                ))}
              </p>
            ),
          )}
        </div>
      ))}
    </>
  );
}
