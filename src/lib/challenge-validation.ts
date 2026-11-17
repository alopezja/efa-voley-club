export const CATEGORIAS = ["Masculino", "Femenino", "Mixto"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type ChallengeValues = {
  nombre: string;
  equipo: string;
  categoria: string;
  email: string;
  telefono: string;
  fecha_propuesta: string;
  lugar: string;
  mensaje: string;
};

export type ChallengeResult =
  | { ok: true; values: ChallengeValues }
  | { ok: false; errors: Record<string, string> };

export function validateChallenge(input: Partial<ChallengeValues>): ChallengeResult {
  const values: ChallengeValues = {
    nombre: (input.nombre ?? "").trim(),
    equipo: (input.equipo ?? "").trim(),
    categoria: (input.categoria ?? "").trim(),
    email: (input.email ?? "").trim(),
    telefono: (input.telefono ?? "").trim(),
    fecha_propuesta: (input.fecha_propuesta ?? "").trim(),
    lugar: (input.lugar ?? "").trim(),
    mensaje: (input.mensaje ?? "").trim(),
  };
  const errors: Record<string, string> = {};

  if (values.nombre.length < 2) errors.nombre = "Escribe tu nombre.";
  if (!CATEGORIAS.includes(values.categoria as Categoria))
    errors.categoria = "Elige la categoría del partido.";
  if (!values.email && !values.telefono)
    errors.contacto = "Déjanos un correo o un teléfono para responderte.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Ese correo no parece válido.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values };
}
