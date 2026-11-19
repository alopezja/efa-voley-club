import { describe, it, expect } from "vitest";
import { validarNumero, numeroDisponible, sugerirNumero, numerosLibres } from "./teams-validation";

describe("teams-validation", () => {
  it("valida rango 1-99", () => {
    expect(validarNumero(0).ok).toBe(false);
    expect(validarNumero(100).ok).toBe(false);
    expect(validarNumero(7).ok).toBe(true);
    expect(validarNumero(1.5).ok).toBe(false);
  });
  it("disponible si no está ocupado", () => {
    expect(numeroDisponible(7, [3, 10])).toBe(true);
    expect(numeroDisponible(3, [3, 10])).toBe(false);
  });
  it("sugiere el preferido si libre, si no el primero libre", () => {
    expect(sugerirNumero(7, [3, 10])).toBe(7);
    expect(sugerirNumero(3, [3, 10])).toBe(1);
  });
  it("sugiere null si todo ocupado", () => {
    const todos = Array.from({ length: 99 }, (_, i) => i + 1);
    expect(sugerirNumero(5, todos)).toBeNull();
  });
  it("lista los libres", () => {
    const libres = numerosLibres([1, 2, 3]);
    expect(libres).not.toContain(1);
    expect(libres[0]).toBe(4);
    expect(libres).toContain(99);
  });
});
