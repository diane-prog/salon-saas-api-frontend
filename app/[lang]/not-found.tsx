import { ButtonLink } from "@/components/ui";
import { getDictionary, locales, localePath } from "@/lib/dictionaries";

export default async function NotFound() {
  const dict = await getDictionary(locales[0]);
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy grain pt-32 pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
      </div>
      <div className="container-x relative flex flex-col items-center gap-6 text-center">
        <span className="text-7xl font-light text-white/10 sm:text-9xl">404</span>
        <h1 className="text-3xl text-white sm:text-4xl">{dict.ui.notFoundTitle}</h1>
        <p className="max-w-md text-base text-slate-300">{dict.ui.notFoundBody}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {locales.map((l) => (
            <ButtonLink key={l} href={localePath(l)} variant="ghost">
              {l === "fr" ? "Accueil" : "Home"}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}