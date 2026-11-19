import { describe, it, expect } from "vitest";
import { POSICIONES, validarPosiciones, labelPosicion } from "./positions";

describe("positions", () => {
  it("lista incluye las 5 + no_se en orden", () => {
    expect(POSICIONES.map((p) => p.key)).toEqual([
      "armador",
      "opuesto",
      "central",
      "punta",
      "libero",
      "no_se",
    ]);
  });
  it("acepta hasta 2 válidas", () => {
    expect(validarPosiciones(["armador", "central"]).ok).toBe(true);
  });
  it("rechaza más de 2", () => {
    expect(validarPosiciones(["armador", "central", "punta"]).ok).toBe(false);
  });
  it("rechaza vacío", () => {
    expect(validarPosiciones([]).ok).toBe(false);
  });
  it("rechaza valores inválidos", () => {
    expect(validarPosiciones(["xxx"]).ok).toBe(false);
  });
  it("'no_se' es válida", () => {
    expect(validarPosiciones(["no_se"]).ok).toBe(true);
  });
  it("labelPosicion devuelve etiqueta legible", () => {
    expect(labelPosicion("libero")).toBe("Líbero");
  });
});
