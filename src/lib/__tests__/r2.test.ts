import { describe, it, expect } from "vitest";
import { buildObjectKey, publicUrlForKey, keyFromPublicUrl } from "@/lib/r2";

describe("buildObjectKey", () => {
  it("genera una key con carpeta, timestamp y nombre seguro", () => {
    const key = buildObjectKey("galeria", "Foto Final.JPG");
    expect(key).toMatch(/^galeria\/\d+-foto-final\.jpg$/);
  });
});

describe("publicUrlForKey", () => {
  it("une la base pública con la key", () => {
    const url = publicUrlForKey("galeria/123-foto.jpg", "https://cdn.efa.com");
    expect(url).toBe("https://cdn.efa.com/galeria/123-foto.jpg");
  });
});

describe("keyFromPublicUrl", () => {
  it("extrae la key cuando la URL pertenece a la base", () => {
    expect(keyFromPublicUrl("https://cdn.efa.com/galeria/1-foto.jpg", "https://cdn.efa.com")).toBe("galeria/1-foto.jpg");
  });
  it("tolera base con barra final", () => {
    expect(keyFromPublicUrl("https://cdn.efa.com/galeria/1-foto.jpg", "https://cdn.efa.com/")).toBe("galeria/1-foto.jpg");
  });
  it("devuelve null si la URL no pertenece a la base", () => {
    expect(keyFromPublicUrl("https://otro.com/x.jpg", "https://cdn.efa.com")).toBeNull();
  });
});
