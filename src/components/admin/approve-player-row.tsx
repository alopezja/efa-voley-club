"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { TIPO_LABEL, type Team } from "@/lib/teams-types";
import { approvePlayer, rejectPlayer, type ApproveState } from "@/app/admin/(panel)/jugadores/actions";

type PlayerLite = {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
};

const initial: ApproveState = { status: "idle" };

function BotonAprobar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Aprobando…" : "Aprobar"}
    </button>
  );
}

export function ApprovePlayerRow({ player, teams }: { player: PlayerLite; teams: Team[] }) {
  const [state, action] = useActionState(approvePlayer, initial);

  return (
    <div className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-efa-bone">
            {player.nombre} {player.apellido}
          </p>
          <p className="text-sm text-efa-ash">
            {[player.email, player.telefono].filter(Boolean).join(" · ") || "Sin contacto"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {teams.length === 0 ? (
            <span className="text-sm text-yellow-300">
              Crea un equipo primero en <span className="font-semibold">Equipos</span>.
            </span>
          ) : (
            <form action={action} className="flex items-center gap-2">
              <input type="hidden" name="id" value={player.id} />
              <select
                name="teamId"
                required
                defaultValue=""
                aria-label="Equipo"
                className="rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone focus:border-efa-red focus:outline-none"
              >
                <option value="" disabled>
                  Equipo…
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({TIPO_LABEL[t.tipo]})
                  </option>
                ))}
              </select>
              <BotonAprobar />
            </form>
          )}
          <form action={rejectPlayer}>
            <input type="hidden" name="id" value={player.id} />
            <button className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red">
              Rechazar
            </button>
          </form>
        </div>
      </div>

      {state.status === "success" && (
        <div className="mt-3 rounded-md border border-green-600/40 bg-green-600/10 p-3">
          <p className="text-sm font-semibold text-green-300">{state.message}</p>
          {state.magicLink && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-efa-ash">Enlace para completar el perfil (compartir si el correo no salió):</p>
              <input
                readOnly
                value={state.magicLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded border border-efa-ash/40 bg-efa-ink px-2 py-1 text-xs text-efa-bone"
              />
            </div>
          )}
        </div>
      )}
      {state.status === "error" && (
        <p className="mt-3 text-sm font-semibold text-efa-red">{state.message}</p>
      )}
    </div>
  );
}
