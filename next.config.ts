import type { NextConfig } from "next";

const serviceRedirects: Record<string, string> = {
  branding: "/services/branding",
  "site-web": "/services/site-web",
  seo: "/services/seo",
  "creation-de-contenu-les-reels-et-les-spots-publicitaires": "/services/contenu-reels-spots",
  evenementiel: "/services/evenementiel",
  "strategie-de-communication-et-marketing": "/services/strategie-communication",
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