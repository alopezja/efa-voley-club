import { describe, it, expect } from "vitest";
import { computeCompleteness, mensajeCompletitud, type CompletenessInput } from "./profile-completeness";

const vacio: CompletenessInput = {
  foto_url: null,
  posiciones: [],
  experiencia: null,
  fecha_nacimiento: null,
  eps: null,
  contacto_emergencia: null,
  mano_dominante: null,
  disponibilidad: [],
  quiere_camiseta: null,
  camiseta_color: null,
  camiseta_talla: null,
  tieneNumero: false,
};

const lleno: CompletenessInput = {
  foto_url: "https://x/f.jpg",
  posiciones: ["armador"],
  experiencia: 5,
  fecha_nacimiento: "2000-01-01",
  eps: "Sura",
  contacto_emergencia: "Mamá 3001112233",
  mano_dominante: "diestro",
  disponibilidad: ["martes"],
  quiere_camiseta: true,
  camiseta_color: "roja",
  camiseta_talla: "M",
  tieneNumero: true,
};

describe("profile-completeness", () => {
  it("vacío = 0%", () => expect(computeCompleteness(vacio).pct).toBe(0));
  it("lleno = 100%", () => expect(computeCompleteness(lleno).pct).toBe(100));
  it("10 ítems en total", () => expect(computeCompleteness(vacio).total).toBe(10));

  it("camiseta sí sin color queda incompleta", () => {
    const r = computeCompleteness({ ...lleno, camiseta_color: null });
    expect(r.items.find((i) => i.key === "camiseta")!.done).toBe(false);
    expect(r.pct).toBeLessThan(100);
  });

  it("no quiere camiseta cuenta como decidido", () => {
    const r = computeCompleteness({
      ...lleno,
      quiere_camiseta: false,
      camiseta_color: null,
      camiseta_talla: null,
    });
    expect(r.items.find((i) => i.key === "camiseta")!.done).toBe(true);
    expect(r.pct).toBe(100);
  });

  it("sin número baja el %", () => {
    const r = computeCompleteness({ ...lleno, tieneNumero: false });
    expect(r.items.find((i) => i.key === "numero")!.done).toBe(false);
    expect(r.pct).toBe(90);
  });

  it("mensaje celebra al 100%", () => {
    expect(mensajeCompletitud(computeCompleteness(lleno))).toContain("completo");
  });
  it("mensaje indica qué falta cuando no está completo", () => {
    const msg = mensajeCompletitud(computeCompleteness(vacio));
    expect(msg.toLowerCase()).toContain("falta");
  });
});
