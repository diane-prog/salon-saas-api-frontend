"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/queries";
import type { AuthUser, Role } from "@/features/auth/types";

/**
 * Contexte de permissions — **même surface que
 * `ldmgV/ldmgwebsiteft/contexts/permissions-context.tsx`** (`hasPermission`,
 * `currentUser`, `loading`, plus `roles` et `permissions`), mais adossé aux
 * **rôles** et non à une table de permissions.
 *
 * Pourquoi ce n'est pas un copier-coller : l'API Salon SaaS ne renvoie **aucun**
 * `permissions` dans `GET /auth/me` (constat documenté : `{ id, email, role,
 * tenantId, isPlatformAdmin }`). Il n'existe pas non plus d'endpoint `/roles` ou
 * `/permissions`. Répliquer la version de la référence aurait donc produit un
 * `hasPermission` qui répond `false` à tout — pire qu'une matrice explicite.
 *
 * Ce qui reste identique : la forme de l'appel `hasPermission(action, ui)`, la
 * matrice déclarative, et le fait que `SUPER_ADMIN` passe partout.
 *
 * ⚠️ CETTE MATRICE EST UNE DÉCISION PRODUIT, PAS UNE LECTURE DE L'API. Le
 * backend ne vérifie que le rôle sur les routes sensibles ; les restrictions
 * fines (`MANAGER` ne supprime pas un confrère) vivent ici, et un appel forgé
 * depuis la console n'est pas arrêté par cette couche. Toute règle qui doit être
 * garantie doit être garantie côté serveur.
 */

/** Rôles autorisés, du plus large au plus étroit. `SUPER_ADMIN` hors tenant. */
const FULL_ACCESS: readonly Role[] = ["SUPER_ADMIN"];

const MATRIX: Record<string, Record<string, readonly Role[]>> = {
  appointments: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    update: ["OWNER", "ADMIN", "MANAGER"],
    delete: ["OWNER", "ADMIN", "MANAGER"],
  },
  customers: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN", "MANAGER"],
    update: ["OWNER", "ADMIN", "MANAGER"],
    delete: ["OWNER", "ADMIN"],
  },
  services: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN", "MANAGER"],
    update: ["OWNER", "ADMIN", "MANAGER"],
    delete: ["OWNER", "ADMIN"],
  },
  staff: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER", "ADMIN"],
  },
  gallery: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    delete: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
  },
  reviews: {
    view: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    create: ["OWNER", "ADMIN", "MANAGER", "STAFF"],
    approve: ["OWNER", "ADMIN", "MANAGER"],
    delete: ["OWNER", "ADMIN", "MANAGER"],
  },
  messages: {
    view: ["OWNER", "ADMIN", "MANAGER"],
    update: ["OWNER", "ADMIN", "MANAGER"],
    delete: ["OWNER", "ADMIN"],
  },
  analytics: {
    view: ["OWNER", "ADMIN", "MANAGER"],
  },
  billing: {
    view: ["OWNER", "ADMIN"],
    update: ["OWNER"],
  },
  team: {
    view: ["OWNER", "ADMIN"],
    create: ["OWNER", "ADMIN"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER"],
  },
  settings: {
    view: ["OWNER", "ADMIN", "MANAGER"],
    update: ["OWNER", "ADMIN"],
  },
  audit: {
    view: ["OWNER", "ADMIN"],
  },
  platform: {
    view: ["SUPER_ADMIN"],
    manage: ["SUPER_ADMIN"],
  },
};

interface PermissionsContextType {
  readonly permissions: string[];
  readonly roles: Role[];
  readonly currentUser: AuthUser | null;
  readonly loading: boolean;
  readonly hasPermission: (action: string, ui: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { readonly children: ReactNode }) {
  const { data, isPending } = useCurrentUser();

  const currentUser = data?.data ?? null;

  const hasPermission = (action: string, ui: string): boolean => {
    if (!currentUser?.role) return false;
    if (currentUser.isPlatformAdmin || FULL_ACCESS.includes(currentUser.role)) return true;

    const allowed = MATRIX[ui.toLowerCase()]?.[action.toLowerCase()];
    if (!allowed) return false;

    return allowed.includes(currentUser.role);
  };

  /* `permissions` reste exposé pour que les écrans écrits contre la référence
     compilent : c'est la liste des couples « action.ui » accordés au rôle. */
  const permissions = currentUser
    ? Object.entries(MATRIX).flatMap(([ui, actions]) =>
        Object.entries(actions)
          .filter(([, roles]) => roles.includes(currentUser.role))
          .map(([action]) => `${action}.${ui}`),
      )
    : [];

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        roles: currentUser ? [currentUser.role] : [],
        currentUser,
        loading: isPending,
        hasPermission,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
