"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Feuille latérale des formulaires de l'espace salon.
 *
 * Même coquille pour toutes les fiches (prestation, membre, cliente) : le cadre,
 * le titre et la fermeture ne doivent pas se mettre à diverger d'un écran à
 * l'autre. Le contenu — les champs — est fourni par l'appelant, qui monte dans
 * `SheetContent` : à la fermeture, Radix démonte le contenu, donc l'état du
 * formulaire repart de zéro à chaque ouverture.
 */
export default function WorkspaceSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
