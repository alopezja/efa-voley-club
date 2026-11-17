import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const display = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "EFA Voley Club · Eso Fue Adentro",
    template: "%s · EFA Voley Club",
  },
  description: "Club de voleibol Eso Fue Adentro (EFA): noticias, convocatorias, galería e inscripciones.",
  openGraph: {
    title: "EFA Voley Club",
    description: "Club de voleibol Eso Fue Adentro (EFA).",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
