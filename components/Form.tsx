"use client";

import { useState, type ReactNode } from "react";

const base =
  "w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-navy">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={base}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-navy">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      <textarea name={name} required={required} placeholder={placeholder} rows={5} className={`${base} resize-y`} />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-navy">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      <select name={name} required={required} defaultValue="" className={`${base} appearance-none bg-[length:1rem] pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormShell({
  children,
  note,
  submitLabel,
  successTitle = "Message envoyé",
  successBody = "Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.",
}: {
  children: ReactNode;
  note?: string;
  submitLabel: string;
  /** Confirmation affichée après l'envoi (une page anglaise doit pouvoir la traduire). */
  successTitle?: string;
  successBody?: string;
}) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-turquoise/30 bg-turquoise/[0.06] p-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-turquoise text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <h3 className="text-xl font-light text-navy">{successTitle}</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{successBody}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-6"
    >
      {note && (
        <p className="rounded-xl bg-navy/[0.04] px-4 py-3 text-xs text-muted">{note}</p>
      )}
      {children}
      <button
        type="submit"
        className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-turquoise px-7 py-4 text-sm font-light text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
      >
        {submitLabel}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}