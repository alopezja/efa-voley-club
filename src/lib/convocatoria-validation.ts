export type ConvocatoriaInput = {
  titulo: string;
  fecha_torneo: string;
  lugar: string;
  categoria: string;
  descripcion: string;
  estado: string;
};

export type ConvocatoriaResult =
  | {
      ok: true;
      values: {
        titulo: string;
        fecha_torneo: string;
        lugar: string;
        categoria: string;
        descripcion: string;
        estado: "borrador" | "publicado";
      };
    }
  | { ok: false; errors: Record<string, string> };

export function validateConvocatoria(input: Partial<ConvocatoriaInput>): ConvocatoriaResult {
  const titulo = (input.titulo ?? "").trim();
  const fecha_torneo = (input.fecha_torneo ?? "").trim();
  const lugar = (input.lugar ?? "").trim();
  const categoria = (input.categoria ?? "").trim();
  const descripcion = (input.descripcion ?? "").trim();
  const estado = (input.estado ?? "borrador").trim() === "publicado" ? "publicado" : "borrador";

  const errors: Record<string, string> = {};
  if (titulo.length < 3) errors.titulo = "El título es muy corto.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values: { titulo, fecha_torneo, lugar, categoria, descripcion, estado } };
}
