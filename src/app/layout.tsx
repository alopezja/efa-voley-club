import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://efavoleyclub.com"),
  title: {
    default: "EFA Voley Club · Eso Fue Adentro",
    template: "%s · EFA Voley Club",
  },
  description:
    "Eso Fue Adentro Voley Club (EFA): formación y competencia de voleibol. Noticias, convocatorias, galería e inscripciones.",
  openGraph: {
    title: "EFA Voley Club · Eso Fue Adentro",
    description: "Club de voleibol EFA: formación y competencia.",
    type: "website",
    locale: "es_ES",
    images: ["/brand/efa-logo.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eso Fue Adentro Voley Club",
  url: "https://efavoleyclub.com",
  logo: "https://efavoleyclub.com/brand/efa-logo.jpg",
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
