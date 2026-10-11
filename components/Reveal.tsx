"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { observeReveal } from "@/lib/reveal";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
};

export default function Reveal({ children, delay = 0, as: Tag = "div", className = "" }: RevealProps) {
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
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
