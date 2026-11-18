import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { getPublishedConvocatorias } from "@/lib/convocatorias";

const BASE = "https://efavoleyclub.com";
const ROUTES = ["", "/nosotros", "/contacto", "/noticias", "/convocatorias", "/galeria", "/registro", "/retar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const fijas = ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified,
    priority: r === "" ? 1 : 0.7,
  }));

  const [articles, convocatorias] = await Promise.all([
    getPublishedArticles(),
    getPublishedConvocatorias(),
  ]);
  const noticias = articles.map((a) => ({
    url: `${BASE}/noticias/${a.slug}`,
    lastModified: new Date(a.updated_at),
    priority: 0.6,
  }));
  const convos = convocatorias.map((c) => ({
    url: `${BASE}/convocatorias/${c.slug}`,
    lastModified: new Date(c.updated_at),
    priority: 0.6,
  }));

  return [...fijas, ...noticias, ...convos];
}
