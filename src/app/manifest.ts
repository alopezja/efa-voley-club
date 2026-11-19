import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EFA Voley Club",
    short_name: "EFA Voley",
    description: "Portal del jugador de EFA Voley Club.",
    start_url: "/jugador",
    scope: "/",
    display: "standalone",
    background_color: "#0e0e0f",
    theme_color: "#0e0e0f",
    icons: [
      { src: "/brand/efa-logo.jpg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
      { src: "/brand/efa-logo.jpg", sizes: "512x512", type: "image/jpeg", purpose: "any" },
    ],
  };
}
