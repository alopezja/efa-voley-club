import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("pasa a minúsculas y usa guiones", () => {
    expect(slugify("Gran Torneo")).toBe("gran-torneo");
  });
  it("quita acentos", () => {
    expect(slugify("Categoría Mañana")).toBe("categoria-manana");
  });
  it("elimina caracteres especiales", () => {
    expect(slugify("¡Vamos EFA!")).toBe("vamos-efa");
  });
  it("colapsa espacios y guiones repetidos", () => {
    expect(slugify("  a   b -- c ")).toBe("a-b-c");
  });
});
