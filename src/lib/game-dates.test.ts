import { describe, it, expect } from "vitest";
import { diaAWeekday, proximasFechas, parseHorario, googleCalendarUrl, fechaColombia, fechaBogota, localBogotaAIso, isoAInputBogota } from "./game-dates";

describe("game-dates", () => {
  it("mapea días (con acentos y mayúsculas)", () => {
    expect(diaAWeekday("Martes")).toBe(2);
    expect(diaAWeekday("miércoles")).toBe(3);
    expect(diaAWeekday("DOMINGO")).toBe(0);
    expect(diaAWeekday("algo")).toBeNull();
  });

  it("próximas fechas incluye hoy si coincide el día", () => {
    // 2026-11-24 es martes
    const martes = new Date(Date.UTC(2026, 10, 24));
    const fechas = proximasFechas("Martes", martes, 2);
    expect(fechas).toEqual(["2026-11-24", "2026-12-01"]);
  });

  it("próximas fechas salta al siguiente match", () => {
    // 2026-11-23 es lunes; próximo viernes = 2026-11-27
    const lunes = new Date(Date.UTC(2026, 10, 23));
    expect(proximasFechas("Viernes", lunes, 1)).toEqual(["2026-11-27"]);
  });

  it("parsea horario am/pm", () => {
    expect(parseHorario("8:00 pm - 11:00 pm")).toEqual({ inicio: "20:00", fin: "23:00" });
    expect(parseHorario("9:30 pm - 11:00 pm")).toEqual({ inicio: "21:30", fin: "23:00" });
    expect(parseHorario("10:00 am - 12:00 pm")).toEqual({ inicio: "10:00", fin: "12:00" });
    expect(parseHorario(null)).toEqual({ inicio: null, fin: null });
  });

  it("fechaColombia aplica offset -05:00", () => {
    const d = fechaColombia("2026-11-24", "20:00");
    expect(d.toISOString()).toBe("2026-11-25T01:00:00.000Z");
  });

  it("fechaBogota aplica la zona de Colombia (UTC-5)", () => {
    // 2026-11-20 02:00 UTC = 2026-11-19 21:00 en Bogotá
    expect(fechaBogota(new Date("2026-11-20T02:00:00Z"))).toBe("2026-11-19");
    expect(fechaBogota(new Date("2026-11-20T12:00:00Z"))).toBe("2026-11-20");
  });

  it("googleCalendarUrl arma el enlace", () => {
    const url = googleCalendarUrl({
      titulo: "Entreno EFA",
      inicio: fechaColombia("2026-11-24", "20:00"),
      fin: fechaColombia("2026-11-24", "23:00"),
      lugar: "Cancha de Manila",
    });
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("dates=20261125T010000Z%2F20261125T040000Z");
    expect(url).toContain("Cancha");
  });
});

describe("zona Bogotá en datetime-local", () => {
  it("interpreta la hora del input como Bogotá (UTC-5)", () => {
    expect(localBogotaAIso("2026-11-30T18:00")).toBe("2026-11-30T23:00:00.000Z");
    expect(localBogotaAIso("2026-11-30T21:30")).toBe("2026-12-01T02:30:00.000Z");
    expect(localBogotaAIso("")).toBeNull();
    expect(localBogotaAIso("basura")).toBeNull();
  });
  it("vuelve a la hora de Bogotá para el input", () => {
    expect(isoAInputBogota("2026-11-30T23:00:00.000Z")).toBe("2026-11-30T18:00");
    expect(isoAInputBogota("2026-12-01T02:30:00.000Z")).toBe("2026-11-30T21:30");
    expect(isoAInputBogota(null)).toBe("");
  });
});
