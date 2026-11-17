import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre (mínimo 2 letras)."),
  email: z.string().trim().email("Revisa tu correo: no parece válido."),
  mensaje: z.string().trim().min(5, "Cuéntanos un poco más (mínimo 5 caracteres)."),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactValidation = {
  ok: boolean;
  errors?: Record<string, string>;
};

export function validateContact(input: unknown): ContactValidation {
  const result = contactSchema.safeParse(input);
  if (result.success) return { ok: true };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
