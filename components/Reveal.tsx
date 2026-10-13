"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { observeReveal } from "@/lib/reveal";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Styles de mise en place de l'élément (position, inclinaison…), fusionnés avec le délai. */
  style?: CSSProperties;
};

export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, () => setShown(true));
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
