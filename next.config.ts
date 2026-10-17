import type { NextConfig } from "next";

const serviceRedirects: Record<string, string> = {
  /* Anciennes adresses d'agence → les six fonctionnalités du produit. Les
     destinations suivent les slugs du dictionnaire : si ceux-ci changent, ICI aussi. */
  branding: "/services/agenda",
  "site-web": "/services/reservation-en-ligne",
  seo: "/services/fiches-clients",
  "creation-de-contenu-les-reels-et-les-spots-publicitaires": "/services/prestations",
  evenementiel: "/services/equipe",
  "strategie-de-communication-et-marketing": "/services/pilotage",
};

/**
 * Legacy WordPress URLs -> new locale-prefixed routes.
 * Every legacy path falls back to the French version, which the proxy would
 * otherwise have to guess from the Accept-Language header.
 */
const legacyPaths = [
  { source: "/a-propos", destination: "/fr/a-propos" },
  { source: "/services", destination: "/fr/services" },
  { source: "/realisations", destination: "/fr/realisations" },
  { source: "/contact", destination: "/fr/contact" },
  { source: "/devis", destination: "/fr/devis" },
  { source: "/", destination: "/fr" },
];

const redirects: { source: string; destination: string; permanent: boolean }[] = [
  ...legacyPaths.map((r) => ({ ...r, permanent: true })),
  ...Object.entries(serviceRedirects).map(([source, destination]) => ({
    source: `/${source}`,
    destination: `/fr${destination}`,
    permanent: true,
  })),
  { source: "/agence-communication-digitale-senegal", destination: "/fr", permanent: true },
  { source: "/feed", destination: "/fr", permanent: false },
  { source: "/wp-admin", destination: "/fr", permanent: false },
  { source: "/wp-content/:path*", destination: "/fr", permanent: false },
];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Next 16 exige une liste blanche de qualités ; 90 pour la photo plein cadre du hero.
    qualities: [75, 90],
  },
  partialPrefetching: true,
  async redirects() {
    return redirects.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: r.permanent,
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;