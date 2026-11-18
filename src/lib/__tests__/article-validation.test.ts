import { describe, it, expect } from "vitest";
import { validateArticle } from "@/lib/article-validation";

describe("validateArticle", () => {
  it("acepta un borrador con solo título", () => {
    const r = validateArticle({ titulo: "Primer partido" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.estado).toBe("borrador");
  });
  it("rechaza título muy corto", () => {
    expect(validateArticle({ titulo: "ab" }).ok).toBe(false);
  });
  it("exige cuerpo para publicar", () => {
    const r = validateArticle({ titulo: "Noticia", estado: "publicado", cuerpo: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.cuerpo).toBeTruthy();
  });
  it("acepta publicado con cuerpo", () => {
    const r = validateArticle({ titulo: "Noticia", estado: "publicado", cuerpo: "Contenido" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.estado).toBe("publicado");
  });
});
