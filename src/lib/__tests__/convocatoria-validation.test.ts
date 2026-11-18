import { describe, it, expect } from "vitest";
import { validateConvocatoria } from "@/lib/convocatoria-validation";

describe("validateConvocatoria", () => {
  it("acepta con solo título", () => {
    const r = validateConvocatoria({ titulo: "Torneo relámpago" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.estado).toBe("borrador");
  });
  it("rechaza título muy corto", () => {
    expect(validateConvocatoria({ titulo: "ab" }).ok).toBe(false);
  });
  it("conserva los campos del torneo", () => {
    const r = validateConvocatoria({
      titulo: "Copa EFA",
      fecha_torneo: "2026-12-01T18:00",
      lugar: "Coliseo",
      categoria: "Mixto",
      estado: "publicado",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.lugar).toBe("Coliseo");
      expect(r.values.estado).toBe("publicado");
    }
  });
});
