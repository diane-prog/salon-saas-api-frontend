"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Rejoue une entrée en fondu très légère à chaque changement de page (sous le rideau). */
export default function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
