// Avisos por correo al club vía Resend. Best-effort: si no hay RESEND_API_KEY
// configurada, no hace nada (no rompe el formulario). No se envía nada sensible
// a terceros más allá del contenido del propio mensaje/registro.

const DEST = process.env.CONTACT_NOTIFY_EMAIL || "efavoleyclub@gmail.com";
const FROM = "EFA Voley Club <onboarding@resend.dev>";

export async function sendClubNotification(subject: string, lines: string[]): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // aún no configurado

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [DEST],
        subject,
        text: lines.filter(Boolean).join("\n"),
      }),
    });
  } catch {
    // Best-effort: un fallo de correo no debe afectar al usuario.
  }
}
