export type RegistroValues = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

export type RegistroResult =
  | { ok: true; values: RegistroValues }
  | { ok: false; errors: Record<string, string> };

export function validateRegistro(input: Partial<RegistroValues>): RegistroResult {
  const values: RegistroValues = {
    nombre: (input.nombre ?? "").trim(),
    apellido: (input.apellido ?? "").trim(),
    email: (input.email ?? "").trim(),
    telefono: (input.telefono ?? "").trim(),
  };
  const errors: Record<string, string> = {};

  if (values.nombre.length < 2) errors.nombre = "Escribe tu nombre.";
  if (values.apellido.length < 2) errors.apellido = "Escribe tu apellido.";
  if (!values.email && !values.telefono)
    errors.contacto = "Déjanos un correo o un teléfono para contactarte.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Ese correo no parece válido.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values };
}
