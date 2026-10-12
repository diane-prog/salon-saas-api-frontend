import { DictionaryProvider } from "@/components/DictionaryProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import PageFade from "@/components/PageFade";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import { getDictionary, isLocale, localePath, locales, localeTags } from "@/lib/dictionaries";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import { Arimo } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

/* PP Neue Montreal (Pangram Pangram) est une police commerciale, non disponible sur Google
   Fonts. On s'appuie donc sur son modèle revendiqué — Helvetica — via Arimo, un clone libre
   aux chasses et à l'interlignage identiques, servi en self-hosted par Next pour un rendu
   identique sur tous les appareils (Windows et Android n'ont pas de vrai Helvetica).
   Variable 400 → 700 : couvre les graisses réellement utilisées par le site. */
const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const jsFlag = `document.documentElement.setAttribute("data-js","")`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const alternates: Record<string, string> = {};
  for (const l of locales) {
    alternates[localeTags[l]] = localePath(l);
  }

  return {
    metadataBase: SITE_URL,
    title: {
      default: `${dict.site.name} — Agence de communication digitale à Dakar`,
      template: `%s | ${dict.site.name}`,
    },
    description: dict.site.tagline,
    applicationName: dict.site.name,
    keywords: [
      "agence communication digitale Dakar",
      "branding Sénégal",
      "création site web Dakar",
      "SEO Afrique",
      "LEEGI Group",
    ],
    authors: [{ name: dict.site.name, url: localePath(lang) }],
    creator: dict.site.name,
    alternates: {
      canonical: localePath(lang),
      languages: alternates,
    },
    openGraph: {
      type: "website",
      siteName: dict.site.name,
      locale: lang === "fr" ? "fr_FR" : "en_US",
      url: localePath(lang),
      title: `${dict.site.name} — Agence de communication digitale à Dakar`,
      description: dict.site.tagline,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: dict.site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.site.name,
      description: dict.site.tagline,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: dict.site.name,
        url: localePath(lang),
        logo: `${SITE_URL}/img/logo.png`,
        image: `${SITE_URL}/img/logo.png`,
        description: dict.site.tagline,
        email: dict.site.email,
        telephone: dict.site.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dakar",
          addressCountry: "SN",
        },
        areaServed: { "@type": "Country", name: "Senegal" },
        sameAs: dict.site.socials.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: dict.site.name,
        url: localePath(lang),
        inLanguage: localeTags[lang],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang={localeTags[lang]} className={`${arimo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${localePath(defaultLang)}`} />
        {locales.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={localeTags[l]}
            href={`${SITE_URL}${localePath(l)}`}
          />
        ))}
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={jsonLd} />
        <DictionaryProvider dict={dict as never} locale={lang}>
          <SmoothScroll />
          <PageTransition>
            <Header />
            <main className="flex-1">
              <PageFade>{children}</PageFade>
            </main>
            <Footer />
          </PageTransition>
        </DictionaryProvider>
      </body>
    </html>
  );
}

const defaultLang = "fr";