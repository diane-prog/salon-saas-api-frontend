"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/dictionaries";
import { setFeedbackMessages } from "@/lib/feedback";

type DictValue = {
  dict: Dictionary;
  locale: Locale;
};

const DictContext = createContext<DictValue | null>(null);

/**
 * Fournit le dictionnaire de la langue courante, et **publie les messages de
 * retour d'action** pour le client React Query.
 *
 * Pourquoi cette publication : les notifications d'écriture sont centralisées
 * dans `lib/query-client.ts`, donc hors de l'arbre React — elles ne peuvent pas
 * lire le dictionnaire par le contexte. Le provider, lui, le peut : il dépose
 * les deux phrases ici dès qu'elles existent, et changer de langue les remplace.
 */
export function DictionaryProvider({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  children: ReactNode;
}) {
  const feedback = dict.ui.feedback;

  useEffect(() => {
    setFeedbackMessages(feedback);
  }, [feedback]);

  return <DictContext.Provider value={{ dict, locale }}>{children}</DictContext.Provider>;
}

export function useDictionary(): DictValue {
  const ctx = useContext(DictContext);
  if (!ctx) throw new Error("useDictionary must be used inside DictionaryProvider");
  return ctx;
}
