export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB (bajo el límite de Vercel)

export function youtubeId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts)\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function validateYoutube(v: { enlace: string; titulo?: string }):
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> } {
  const id = youtubeId(v.enlace ?? "");
  if (!id) return { ok: false, errors: { enlace: "Pega un enlace válido de YouTube." } };
  return { ok: true, id };
}

export function validatePhotoMeta(v: { contentType: string; size: number }):
  | { ok: true }
  | { ok: false; errors: Record<string, string> } {
  if (!ALLOWED_IMAGE_TYPES.includes(v.contentType))
    return { ok: false, errors: { archivo: "Formato no permitido. Usa JPG, PNG o WebP." } };
  if (v.size > MAX_IMAGE_BYTES)
    return { ok: false, errors: { archivo: "La imagen es muy pesada (máx. 4 MB)." } };
  return { ok: true };
}
