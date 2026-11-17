import { describe, it, expect } from "vitest";
import { validateChallenge } from "@/lib/challenge-validation";

describe("validateChallenge", () => {
  it("acepta un reto con nombre y un contacto", () => {
    expect(validateChallenge({ nombre: "Los Tigres", telefono: "3001112233" }).ok).toBe(true);
  });
  it("exige nombre", () => {
    const r = validateChallenge({ nombre: "", email: "x@y.com" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.nombre).toBeTruthy();
  });
  it("exige al menos un contacto", () => {
    const r = validateChallenge({ nombre: "Equipo" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.contacto).toBeTruthy();
  });
  it("rechaza email mal formado", () => {
    const r = validateChallenge({ nombre: "Equipo", email: "mal" });
    expect(r.ok).toBe(false);
  });
});
