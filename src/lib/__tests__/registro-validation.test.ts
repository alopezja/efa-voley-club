import { describe, it, expect } from "vitest";
import { validateRegistro } from "@/lib/registro-validation";

const base = { nombre: "Ana", apellido: "Pérez", categoria: "Femenino", email: "ana@mail.com", telefono: "" };

describe("validateRegistro", () => {
  it("acepta un registro completo", () => {
    const r = validateRegistro(base);
    expect(r.ok).toBe(true);
  });
  it("exige nombre y apellido", () => {
    const r = validateRegistro({ ...base, nombre: "", apellido: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.nombre && r.errors.apellido).toBeTruthy();
  });
  it("rechaza categoría inválida", () => {
    const r = validateRegistro({ ...base, categoria: "Otra" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.categoria).toBeTruthy();
  });
  it("acepta cualquiera de las tres categorías", () => {
    for (const c of ["Masculino", "Femenino", "Mixto"]) {
      expect(validateRegistro({ ...base, categoria: c }).ok).toBe(true);
    }
  });
  it("exige al menos un contacto", () => {
    const r = validateRegistro({ ...base, email: "", telefono: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.contacto).toBeTruthy();
  });
  it("acepta solo teléfono", () => {
    expect(validateRegistro({ ...base, email: "", telefono: "3001112233" }).ok).toBe(true);
  });
  it("rechaza email mal formado", () => {
    const r = validateRegistro({ ...base, email: "no-es-correo" });
    expect(r.ok).toBe(false);
  });
});
