import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imágenes públicas en Cloudflare R2 (galería, fotos de jugadores).
      { protocol: "https", hostname: "pub-12511af40ede427eb5b372527da53643.r2.dev" },
    ],
  },
  experimental: {
    // Las fotos se comprimen en el cliente (~200–500 KB), pero damos margen
    // para que subir una imagen grande no rompa el Server Action (límite 1 MB por defecto).
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
