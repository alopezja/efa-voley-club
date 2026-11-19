import type { Metadata, Viewport } from "next";
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
    "Eso Fue Adentro Voley Club (EFA): club de voleibol de la comunidad para jugar por hobby, abierto a todas las edades. Noticias, convocatorias, galería e inscripciones.",
  openGraph: {
    title: "EFA Voley Club · Eso Fue Adentro",
    description: "Club de voleibol de la comunidad, para jugar por gusto y a toda edad.",
    type: "website",
    locale: "es_ES",
    images: ["/brand/efa-logo.jpg"],
  },
  appleWebApp: { capable: true, title: "EFA Voley", statusBarStyle: "black" },
  icons: { apple: "/brand/efa-logo.jpg" },
};

export const viewport: Viewport = { themeColor: "#0e0e0f" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
