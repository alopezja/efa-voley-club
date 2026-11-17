import { describe, it, expect } from "vitest";
import { validateChallenge } from "@/lib/challenge-validation";

const base = { nombre: "Los Tigres", categoria: "Mixto", telefono: "3001112233" };

describe("validateChallenge", () => {
  it("acepta un reto con nombre, categoría y un contacto", () => {
    expect(validateChallenge(base).ok).toBe(true);
  });
  it("exige nombre", () => {
    const r = validateChallenge({ ...base, nombre: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.nombre).toBeTruthy();
  });
  it("exige categoría válida", () => {
    const r = validateChallenge({ ...base, categoria: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.categoria).toBeTruthy();
  });
  it("rechaza categoría fuera de la lista", () => {
    expect(validateChallenge({ ...base, categoria: "Otra" }).ok).toBe(false);
  });
  it("acepta las tres categorías", () => {
    for (const c of ["Masculino", "Femenino", "Mixto"]) {
      expect(validateChallenge({ ...base, categoria: c }).ok).toBe(true);
    }
  });
  it("exige al menos un contacto", () => {
    const r = validateChallenge({ ...base, telefono: "", email: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.contacto).toBeTruthy();
  });
  it("rechaza email mal formado", () => {
    expect(validateChallenge({ ...base, email: "mal" }).ok).toBe(false);
  });
});
