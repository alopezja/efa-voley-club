import type { MetadataRoute } from "next";

const BASE = "https://efavoleyclub.com";
const ROUTES = ["", "/nosotros", "/contacto", "/noticias", "/convocatorias", "/galeria", "/registro", "/retar"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified,
    priority: r === "" ? 1 : 0.7,
  }));
}
