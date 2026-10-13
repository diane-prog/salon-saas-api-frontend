"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Close } from "@/components/Icons";

/**
 * Sheet — le composant de shadcn/ui, avec la même API que l'original :
 * `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`,
 * `SheetTitle`, `SheetDescription`. Il repose sur la même primitive (Radix Dialog).
 *
 * Trois écarts assumés avec le fichier publié par shadcn, tous imposés par ce dépôt :
 *
 * 1. Pas de CLI shadcn : `npx shadcn init` réécrit `app/globals.css` (jetons
 *    `--background`, `--foreground`…) et écrase le thème maison. Ici les classes
 *    utilisent donc directement les jetons du projet (`navy`, `muted`, `brand`).
 * 2. Pas de `cn()` (le projet fusionne ses classes à la main) ni de `lucide-react`
 *    (les icônes vivent dans `components/Icons`).
 * 3. Pas de `tw-animate-css` : les entrées/sorties sont des animations CSS définies
 *    dans `app/globals.css`, branchées sur les attributs `data-state` de Radix. C'est
 *    le même partage des rôles que le reste du site (CSS pour l'animation, JS pour
 *    l'état) et l'effet suit `prefers-reduced-motion` comme tout le reste.
 */

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className = "", ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={`sheet-overlay fixed inset-0 z-50 bg-navy/40 backdrop-blur-[2px] ${className}`}
      {...props}
    />
  );
}

const sideClasses = {
  top: "left-0 right-0 top-0 border-b",
  right: "inset-y-0 right-0 h-full border-l",
  bottom: "left-0 right-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full border-r",
} as const;

const sideSizes = {
  top: "h-1/2 w-full",
  right: "w-full sm:max-w-lg",
  bottom: "h-1/2 w-full",
  left: "w-full sm:max-w-lg",
} as const;

function SheetContent({
  className = "",
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof sideClasses;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={`sheet-panel fixed z-50 flex flex-col gap-6 overflow-y-auto border-navy/10 bg-white p-6 shadow-lift sm:p-8 ${sideClasses[side]} ${sideSizes[side]} ${className}`}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-navy/60 transition-all duration-300 hover:bg-navy/[0.06] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Fermer"
        >
          <Close className="h-5 w-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className = "", ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={`flex flex-col gap-2 pr-12 ${className}`} {...props} />;
}

function SheetFooter({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-footer" className={`mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end ${className}`} {...props} />
  );
}

function SheetTitle({ className = "", ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={`text-2xl leading-[1.2] text-navy sm:text-[1.75rem] ${className}`}
      {...props}
    />
  );
}

function SheetDescription({ className = "", ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={`text-sm leading-relaxed text-muted ${className}`}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
