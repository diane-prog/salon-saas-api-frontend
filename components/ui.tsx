import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  const alignCls = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  return (
    <Reveal className={`flex max-w-3xl flex-col gap-4 ${alignCls}`}>
      {eyebrow && (
        <span
          className={`text-xs font-medium uppercase tracking-[0.18em] ${
            isDark ? "text-turquoise" : "text-brand"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <SplitText
        as="h2"
        text={title}
        delay={0.05}
        className={`text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem] ${
          isDark ? "text-white" : "text-navy"
        }`}
      />
      {body && (
        <p className={`text-base leading-relaxed sm:text-lg ${isDark ? "text-slate-300" : "text-muted"}`}>
          {body}
        </p>
      )}
    </Reveal>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "glass";
  className?: string;
}) {
  const base =
    "group inline-flex items-center justify-center gap-3 px-7 py-4 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  const styles = {
    /* Action principale : l'encre du site, qui passe au laiton au survol. Aucun
       dégradé, aucun relief — le site est une maison, pas un gabarit. */
    primary: "bg-ink text-paper hover:bg-brand",
    ghost: "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20",
    outline: "bg-white text-navy ring-1 ring-navy/12 hover:ring-brand hover:text-brand",
    /* Sur média sombre (hero) : TRANSPARENT au repos, le fond n'apparaît qu'au
       survol. Le filet blanc garde la pastille lisible sur la vidéo sans rien
       peindre derrière le texte. */
    glass: "bg-transparent text-white ring-1 ring-white/30 hover:bg-white/15 backdrop-blur-sm",
  }[variant];

  return (
    <Link href={href as never} className={`${base} ${styles} ${className}`}>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Action en texte : c'est le seul bouton du vocabulaire « galerie » — un mot et un filet,
 * aucun fond, aucune pastille. `strong` appuie le filet pour l'action principale.
 */
export function TextLink({
  href,
  children,
  strong = false,
  tone = "paper",
  className = "",
}: {
  href: string;
  children: ReactNode;
  strong?: boolean;
  /** `navy` pour un lien posé sur un fond sombre. */
  tone?: "paper" | "navy";
  className?: string;
}) {
  const styles =
    tone === "navy"
      ? strong
        ? "border-white/60 text-white hover:border-white hover:text-turquoise"
        : "border-white/30 text-white/80 hover:border-white/70 hover:text-turquoise"
      : strong
        ? "border-navy/45 text-navy hover:border-ink hover:text-brand"
        : "border-navy/20 text-navy/80 hover:border-ink hover:text-brand";

  return (
    <Link
      href={href as never}
      className={`group inline-flex items-center gap-2 border-b pb-1 text-[0.95rem] leading-none transition-colors duration-300 ${styles} ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${
        tone === "dark" ? "bg-white/10 text-turquoise ring-1 ring-white/15" : "bg-brand/10 text-brand"
      }`}
    >
      {children}
    </span>
  );
}

export function CheckList({ items, tone = "light" }: { items: string[]; tone?: "light" | "dark" }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            tone === "dark" ? "bg-white/[0.06] text-slate-200 ring-1 ring-white/10" : "bg-brand/[0.05] text-navy"
          }`}
        >
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}