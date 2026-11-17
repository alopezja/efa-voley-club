import { describe, it, expect } from "vitest";
import {
  youtubeId,
  validateYoutube,
  validatePhotoMeta,
} from "@/lib/gallery-validation";

describe("youtubeId", () => {
  it("extrae id de watch?v=", () => expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de youtu.be", () => expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de /shorts/", () => expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de /embed/", () => expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("devuelve null si no es youtube", () => expect(youtubeId("https://vimeo.com/123")).toBeNull());
});

describe("validateYoutube", () => {
  it("ok con url válida y devuelve id", () => {
    const r = validateYoutube({ enlace: "https://youtu.be/dQw4w9WgXcQ", titulo: "Partido" });
    expect(r.ok && r.id).toBe("dQw4w9WgXcQ");
  });
  it("error si el enlace no es youtube", () => {
    const r = validateYoutube({ enlace: "no-url", titulo: "" });
    expect(r.ok).toBe(false);
  });
});

describe("validatePhotoMeta", () => {
  it("rechaza tipo no permitido", () => {
    expect(validatePhotoMeta({ contentType: "application/pdf", size: 100 }).ok).toBe(false);
  });
  it("rechaza tamaño excesivo", () => {
    expect(validatePhotoMeta({ contentType: "image/jpeg", size: 50 * 1024 * 1024 }).ok).toBe(false);
  });
  it("acepta jpeg pequeño", () => {
    expect(validatePhotoMeta({ contentType: "image/jpeg", size: 200 * 1024 }).ok).toBe(true);
  });
});
