import { describe, it, expect } from "vitest";
import { buildObjectKey, publicUrlForKey } from "@/lib/r2";

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
