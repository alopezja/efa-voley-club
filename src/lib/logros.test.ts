import { describe, it, expect } from "vitest";
import { calcularLogros, contarConseguidos } from "./logros";

describe("logros", () => {
  it("un jugador nuevo solo tiene 'bienvenido'", () => {
    const l = calcularLogros({ perfilCompleto: false, totalVoy: 0 });
    expect(contarConseguidos(l)).toBe(1);
    expect(l.find((x) => x.key === "bienvenido")!.conseguido).toBe(true);
  });

  it("perfil completo desbloquea su logro", () => {
    const l = calcularLogros({ perfilCompleto: true, totalVoy: 0 });
    expect(l.find((x) => x.key === "perfil_completo")!.conseguido).toBe(true);
  });

  it("umbrales de juegos", () => {
    expect(calcularLogros({ perfilCompleto: true, totalVoy: 1 }).find((x) => x.key === "primer_juego")!.conseguido).toBe(true);
    expect(calcularLogros({ perfilCompleto: true, totalVoy: 4 }).find((x) => x.key === "cinco_juegos")!.conseguido).toBe(false);
    expect(calcularLogros({ perfilCompleto: true, totalVoy: 5 }).find((x) => x.key === "cinco_juegos")!.conseguido).toBe(true);
    expect(calcularLogros({ perfilCompleto: true, totalVoy: 10 }).find((x) => x.key === "diez_juegos")!.conseguido).toBe(true);
  });

  it("jugador veterano consigue todos", () => {
    const l = calcularLogros({ perfilCompleto: true, totalVoy: 12 });
    expect(contarConseguidos(l)).toBe(5);
  });
});
