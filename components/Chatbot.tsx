"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Close, Mail, Spark } from "@/components/Icons";
import ChatAnswer from "@/components/ChatAnswer";
import { useDictionary } from "@/components/DictionaryProvider";
import { LABEL } from "@/lib/editorial";

type Turn = { role: "user" | "assistant"; content: string };

/**
 * Assistant conversationnel : une fenêtre de discussion posée dans le coin de l'écran, à la
 * grammaire des panneaux du site — encre, filet, carré, texte papier.
 *
 * Ce que la fenêtre garantit :
 * - la réponse s'ÉCRIT : on lit le flux renvoyé par `/api/chat` et on l'ajoute au fil de
 *   l'eau. Pas d'écran d'attente, pas de « … » qui tourne pendant trois secondes ;
 * - un envoi à la fois (`pending`) : pas de flux concurrents qui s'entremêlent ;
 * - le fil ne grandit que vers le bas et reste collé au dernier message (défilement
 *   recalculé à chaque tour, sans état) ;
 * - la réponse du serveur indisponible n'est jamais avalée en silence : on retire la bulle
 *   vide et on affiche les coordonnées de l'équipe, ce qui est toujours une issue ;
 * - Échap ferme, et le champ reprend le focus à chaque ouverture — on ouvre une fenêtre de
 *   chat pour écrire.
 *
 * La fenêtre reste MONTÉE une fois ouverte (l'appelant s'en charge) : rouvrir reprend la
 * conversation là où elle était.
 */
export default function Chatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dict, locale } = useDictionary();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Échap ferme la fenêtre. Le panneau n'est pas un panneau plein écran : il ne prend pas la
     page en otage, donc pas de piège à focus ni de défilement figé — seulement la sortie. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /* Le focus part sur le champ à l'ouverture (après l'entrée, pour ne pas la couper). */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 140);
    return () => window.clearTimeout(id);
  }, [open]);

  /* Le fil suit son dernier message : on écrit dans le DOM, pas dans l'état. */
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [turns, pending]);

  const send = async (value: string) => {
    const content = value.trim();
    if (!content || pending) return;

    const asked: Turn[] = [...turns, { role: "user", content }];
    /* La bulle de l'assistant est posée VIDE : elle se remplit au fil du flux, c'est ce qui
       fait qu'on voit la réponse arriver au lieu d'un blanc. */
    setTurns([...asked, { role: "assistant", content: "" }]);
    setInput("");
    setFailed(false);
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: asked, locale }),
      });
      if (!response.ok || !response.body) throw new Error(String(response.status));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      for (;;) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(chunk, { stream: true });
        setTurns([...asked, { role: "assistant", content: answer }]);
      }

      /* Flux clos sans un mot : ce n'est pas une réponse, on le dit. */
      if (!answer.trim()) throw new Error("empty");
    } catch {
      setTurns(asked);
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      id="belora-chat"
      role="dialog"
      aria-label={dict.ui.chat.title}
      aria-hidden={!open}
      /* Fermée, la fenêtre reste montée (la conversation est gardée) : `inert` la retire du
         parcours clavier et des technologies d'assistance. Sans lui, la tabulation entrait
         dans un champ invisible — un piège que l'opacité seule ne règle pas. */
      inert={!open}
      className={`fixed bottom-24 right-4 z-70 flex h-[min(30rem,68vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden bg-ink/90 text-paper ring-1 ring-paper/15 backdrop-blur-md transition-[opacity,transform] duration-300 ease-out sm:right-6 ${
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-paper/10 px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-light text-paper">
            <Spark className="h-4 w-4 text-turquoise" />
            {dict.ui.chat.title}
          </p>
          <p className={`mt-2 ${LABEL} text-paper/40`}>{dict.ui.chat.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.ui.chat.close}
          className="-mr-1 grid h-9 w-9 shrink-0 place-items-center text-paper/60 ring-1 ring-paper/15 transition-colors hover:text-paper hover:ring-paper/40"
        >
          <Close className="h-4 w-4" />
        </button>
      </div>

      {/* `data-lenis-prevent` : Lenis écoute la molette sur tout le document et la
          consommerait — sans cette marque, le fil ne défilerait pas. */}
      <div
        ref={listRef}
        data-lenis-prevent
        aria-live="polite"
        className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 py-4"
      >
        <div className="max-w-[92%] self-start bg-paper/[0.07] px-4 py-3 text-sm leading-relaxed text-paper/85 ring-1 ring-paper/10">
          <ChatAnswer text={dict.ui.chat.greeting} />
        </div>

        {turns.length === 0 &&
          dict.ui.chat.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void send(suggestion)}
              className="group flex items-center justify-between gap-3 px-1 py-2 text-left text-sm font-light text-paper/70 transition-colors hover:text-turquoise"
            >
              {suggestion}
              <ArrowRight className="h-4 w-4 shrink-0 text-paper/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-turquoise" />
            </button>
          ))}

        {turns.map((turn, i) => (
          /* Question du visiteur : son texte tel quel. Réponse de l'assistant : mise en forme
             (paragraphes, puces, liens nommés) — voir `ChatAnswer`. */
          <div
            key={i}
            className={`max-w-[92%] px-4 py-3 text-sm leading-relaxed ${
              turn.role === "user"
                ? "self-end whitespace-pre-line bg-gradient-to-r from-brand to-turquoise text-white"
                : "self-start bg-paper/[0.07] text-paper/85 ring-1 ring-paper/10"
            }`}
          >
            {turn.role === "user" ? turn.content : <ChatAnswer text={turn.content} />}
            {/* Curseur d'écriture : la réponse n'est pas finie. */}
            {pending && turn.role === "assistant" && i === turns.length - 1 && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-turquoise align-middle" />
            )}
          </div>
        ))}

        {failed && (
          <div className="max-w-[92%] self-start border-l-2 border-orange/70 bg-paper/[0.05] px-4 py-3 text-sm leading-relaxed text-paper/70">
            {dict.ui.chat.error}{" "}
            <a href={`mailto:${dict.site.email}`} className="text-turquoise underline-offset-4 hover:underline">
              {dict.site.email}
            </a>
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-3 border-t border-paper/10 px-5 py-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={dict.ui.chat.placeholder}
          aria-label={dict.ui.chat.placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-light text-paper placeholder:text-paper/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || input.trim().length === 0}
          aria-label={dict.ui.chat.send}
          className="grid h-9 w-9 shrink-0 place-items-center bg-gradient-to-r from-brand to-turquoise text-white transition-opacity duration-300 disabled:opacity-30"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="flex items-center gap-2 border-t border-paper/[0.06] px-5 py-3 text-[0.68rem] uppercase tracking-[0.2em] text-paper/30">
        <Mail className="h-3.5 w-3.5" />
        <a href={`mailto:${dict.site.email}`} className="transition-colors hover:text-paper">
          {dict.site.email}
        </a>
      </p>
    </div>
  );
}
