"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { useDictionary } from "@/components/DictionaryProvider";

type Project = {
  title: string;
  body: string;
  category: string;
  image: string;
};

export default function ProjectFilter({ projects }: { projects: Project[] }) {
  const { dict } = useDictionary();
  const filters = dict.filters;
  const [active, setActive] = useState(filters[0]);

  const visible = useMemo(
    () =>
      active === filters[0]
        ? projects
        : projects.filter((p) => p.category === active),
    [active, filters, projects],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            aria-pressed={active === f}
            className={`rounded-full px-5 py-2.5 text-sm font-light transition-all duration-300 ${
              active === f
                ? "bg-gradient-to-r from-brand to-turquoise text-white shadow-soft"
                : "bg-white text-navy ring-1 ring-navy/10 hover:ring-brand hover:text-brand"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 70} className="h-full">
            <article className="glow-card group flex h-full flex-col overflow-hidden bg-white shadow-soft">
              <div className="relative aspect-[4/3] overflow-hidden bg-navy/5">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-navy backdrop-blur">
                  {p.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="text-base font-light leading-snug text-navy">{p.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="mt-14 text-center text-sm text-muted">
          No projects in this category yet.
        </p>
      )}
    </div>
  );
}