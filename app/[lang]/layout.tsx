import Providers from "@/app/providers";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary, isLocale, localePath, locales, localeTags } from "@/lib/dictionaries";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

/* Police du site : Sora, servie en self-hosted par Next (aucune requête vers Google depuis
   le navigateur — le téléchargement n'a lieu qu'à la COMPILATION). Variable 100 → 800, donc
   un seul fichier qui couvre toutes les graisses du site. Le nom de la variable CSS reste
   `--font-jakarta` pour ne pas toucher au jeton `--font-sans` de `globals.css`.

   Si la compilation affiche « Failed to download Sora from Google Fonts », c'est que la
   machine qui compile n'atteint pas fonts.googleapis.com : le repli système prend le relais
   sans casser la mise en page, et un simple rebuild une fois le réseau revenu suffit. */
const jakarta = Sora({
  variable: "--font-jakarta",
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
      default: `${dict.site.name} — Le logiciel de gestion des salons`,
      template: `%s | ${dict.site.name}`,
    },
    description: dict.site.tagline,
    applicationName: dict.site.name,
    keywords: [
      "logiciel salon de coiffure",
      "logiciel institut de beauté",
      "gestion salon",
      "réservation en ligne salon",
      "agenda coiffeur",
      "logiciel barbier",
      dict.site.name,
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
      title: `${dict.site.name} — ${dict.site.tagline}`,
      description: dict.site.tagline,
      /* Pas d'`images` ici : l'image de partage vient du FICHIER `app/opengraph-image.png`
         (convention de Next), qui pose aussi son type et ses dimensions réels — et son texte
         de remplacement via `opengraph-image.alt.txt`. La déclarer en plus, c'était deux
         sources pour une seule image : celle du code (`/opengraph-image`, qui n'est pas une
         route — elle redirigeait vers l'accueil) écrasait celle du fichier. */
    },
    twitter: {
      card: "summary_large_image",
      title: dict.site.name,
      description: dict.site.tagline,
      /* Twitter retombe sur l'image Open Graph quand la sienne n'est pas donnée : même
         fichier, même adresse, rien à maintenir en double. */
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
        /* `SoftwareApplication` et non `ProfessionalService` : le site ne présente
           plus une agence mais un logiciel. Le type décide de ce que les moteurs
           comprennent et de ce qu'ils affichent ; le laisser sur l'ancien métier
           décrirait la mauvaise chose. */
        "@type": ["Organization", "SoftwareApplication"],
        "@id": `${SITE_URL}/#organization`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        name: dict.site.name,
        url: localePath(lang),
        logo: `${SITE_URL}/icon.png`,
        image: `${SITE_URL}/icon.png`,
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
    <html lang={localeTags[lang]} className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
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
        {/* React Query + notifications : l'enveloppe la PLUS EXTERNE, parce que tout
            écran qui lit l'API en dépend (vitrine, accès, tableau de bord, CMS). */}
        <Providers>
          <DictionaryProvider dict={dict as never} locale={lang}>
            {children}
          </DictionaryProvider>
        </Providers>
      </body>
    </html>
  );
}

const defaultLang = "fr";