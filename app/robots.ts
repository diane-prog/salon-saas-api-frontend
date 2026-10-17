import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * `robots.txt` — le plan du site suit l'adresse canonique (`lib/seo`), il ne la
 * réécrit plus : une seule source pour le domaine.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
