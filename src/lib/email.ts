// Avisos por correo al club vía Resend. Best-effort: si no hay RESEND_API_KEY
// configurada, no hace nada (no rompe el formulario). No se envía nada sensible
// a terceros más allá del contenido del propio mensaje/registro.

const DEST = process.env.CONTACT_NOTIFY_EMAIL || "efavoleyclub@gmail.com";
const FROM = "EFA Voley Club <club@efavoleyclub.com>";

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

// Invitación al jugador aprobado con su enlace mágico para completar el perfil.
// Nota: enviar a un correo distinto de la cuenta Resend requiere dominio verificado;
// hasta entonces esto puede fallar (devuelve ok:false) y se usa el enlace del panel.
export async function sendPlayerInvite(
  email: string,
  nombre: string,
  link: string
): Promise<{ ok: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "¡Bienvenido/a al club! Completa tu perfil 🏐",
        text: [
          `Hola ${nombre},`,
          "",
          "¡Tu registro en EFA Voley Club fue aprobado! 🎉",
          "",
          "Entra con este enlace (sin contraseña) y completa tu perfil del equipo:",
          link,
          "",
          "Nos vemos en la cancha.",
          "— EFA Voley Club",
        ].join("\n"),
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
