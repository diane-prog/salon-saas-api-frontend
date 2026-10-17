"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/toaster";

/**
 * Providers de l'application — même câblage que
 * `ldmgV/ldmgwebsiteft/app/providers.tsx` : un seul `QueryClientProvider` autour
 * de l'arbre, plus les devtools (retirées du bundle de production par Next).
 *
 * Le `Toaster` est monté ici, et pas dans la mise en page : c'est le pendant du
 * `useToast` global — n'importe quel écran peut notifier sans rien installer.
 * `initialIsOpen` reste à `false` : la référence ouvre le panneau des devtools à
 * chaque chargement, ce qui recouvre le bas des pages.
 */
interface ProvidersProps {
  readonly children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
