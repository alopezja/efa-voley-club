import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imágenes públicas en Cloudflare R2 (galería, fotos de jugadores).
      { protocol: "https", hostname: "pub-12511af40ede427eb5b372527da53643.r2.dev" },
    ],
  },
};

export default nextConfig;
