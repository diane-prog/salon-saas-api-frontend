"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/dictionaries";

type DictValue = {
  dict: Dictionary;
  locale: Locale;
};

const DictContext = createContext<DictValue | null>(null);

export function DictionaryProvider({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  children: ReactNode;
}) {
  return <DictContext.Provider value={{ dict, locale }}>{children}</DictContext.Provider>;
}

export function useDictionary(): DictValue {
  const ctx = useContext(DictContext);
  if (!ctx) throw new Error("useDictionary must be used inside DictionaryProvider");
  return ctx;
}