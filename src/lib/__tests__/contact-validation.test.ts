import { describe, it, expect } from "vitest";
import { validateContact } from "@/lib/contact-validation";

describe("validateContact", () => {
  it("acepta datos válidos", () => {
    expect(validateContact({ nombre: "Ana", email: "a@b.com", mensaje: "Hola equipo" }).ok).toBe(true);
  });
  it("rechaza email inválido", () => {
    expect(validateContact({ nombre: "Ana", email: "noemail", mensaje: "Hola equipo" }).ok).toBe(false);
  });
  it("rechaza mensaje corto", () => {
    expect(validateContact({ nombre: "Ana", email: "a@b.com", mensaje: "hi" }).ok).toBe(false);
  });
  it("rechaza nombre vacío", () => {
    expect(validateContact({ nombre: "", email: "a@b.com", mensaje: "Hola equipo" }).ok).toBe(false);
  });
});
