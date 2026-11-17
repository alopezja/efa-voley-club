import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
