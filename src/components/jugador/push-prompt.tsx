"use client";

import { useNotif } from "./notif-provider";

// Tarjeta de onboarding del cuerpo: aparece arriba de "Próximos juegos" solo
// mientras el jugador no ha activado los avisos. Una vez activados, todo vive
// en el ícono 🔔 del menú superior y esta tarjeta desaparece.
export function PushPrompt() {
  const { pushEstado, pushBusy, activarPush } = useNotif();

  if (pushEstado !== "inactivo") return null;

  return (
    <section className="rounded-2xl border border-efa-red/40 bg-gradient-to-b from-efa-red/[0.12] to-transparent p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <h2 className="text-xl font-semibold text-efa-bone">🔔 Activa tus notificaciones</h2>
      <p className="mb-3 mt-1 text-sm text-efa-ash">
        Entérate al instante cuando te convoquen o haya juego. Luego las administras desde el ícono 🔔 arriba.
      </p>
      <button
        onClick={activarPush}
        disabled={pushBusy}
        className="w-full rounded-md bg-efa-red px-4 py-2.5 text-sm font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
      >
        {pushBusy ? "Activando…" : "Activar notificaciones"}
      </button>
    </section>
  );
}
