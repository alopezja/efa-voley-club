export type ArticleInput = {
  titulo: string;
  resumen: string;
  cuerpo: string;
  autor: string;
  estado: string;
};

export type ArticleResult =
  | { ok: true; values: { titulo: string; resumen: string; cuerpo: string; autor: string; estado: "borrador" | "publicado" } }
  | { ok: false; errors: Record<string, string> };

export function validateArticle(input: Partial<ArticleInput>): ArticleResult {
  const titulo = (input.titulo ?? "").trim();
  const resumen = (input.resumen ?? "").trim();
  const cuerpo = (input.cuerpo ?? "").trim();
  const autor = (input.autor ?? "").trim();
  const estado = (input.estado ?? "borrador").trim() === "publicado" ? "publicado" : "borrador";

  const errors: Record<string, string> = {};
  if (titulo.length < 3) errors.titulo = "El título es muy corto.";
  if (estado === "publicado" && cuerpo.length < 1)
    errors.cuerpo = "Escribe el contenido antes de publicar.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values: { titulo, resumen, cuerpo, autor, estado } };
}
