"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { TIPO_LABEL, type Team, type TeamTipo } from "@/lib/teams-types";
import { reenviarEnlace, type ApproveState } from "@/app/admin/(panel)/jugadores/actions";

type PlayerRow = {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  pct: number;
  equipos: { nombre: string; tipo: string }[];
};

const initial: ApproveState = { status: "idle" };

function BotonEnviar({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red disabled:opacity-60"
    >
      {pending ? "Enviando…" : label}
    </button>
  );
}

export function InvitePlayerRow({ player, teams }: { player: PlayerRow; teams: Team[] }) {
  const [state, action] = useActionState(reenviarEnlace, initial);
  const sinEquipo = player.equipos.length === 0;
  const label = sinEquipo ? "Asignar equipo e invitar" : "Reenviar enlace";

  return (
    <div className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-efa-bone">
            {player.nombre} {player.apellido}
          </p>
          <p className="text-sm text-efa-ash">
            {[player.email, player.telefono].filter(Boolean).join(" · ") || "Sin contacto"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {player.equipos.map((e, i) => (
              <span key={i} className="rounded bg-efa-ash/15 px-2 py-0.5 text-xs text-efa-bone">
                {e.nombre} · {TIPO_LABEL[e.tipo as TeamTipo] ?? e.tipo}
              </span>
            ))}
            {sinEquipo && <span className="text-xs text-yellow-300">Sin equipo asignado</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-2" title="Perfil completo">
            <span className="h-2 w-24 overflow-hidden rounded-full bg-efa-ash/20">
              <span
                className={`block h-full ${player.pct >= 100 ? "bg-green-400" : "bg-efa-red"}`}
                style={{ width: `${player.pct}%` }}
              />
            </span>
            <span className="text-xs font-semibold text-efa-ash">{player.pct}%</span>
          </span>

          {player.email ? (
            <form action={action} className="flex items-center gap-2">
              <input type="hidden" name="id" value={player.id} />
              {sinEquipo && teams.length > 0 && (
                <select
                  name="teamId"
                  defaultValue=""
                  aria-label="Equipo"
                  className="rounded-md border border-efa-ash/40 bg-efa-ink px-2 py-2 text-sm text-efa-bone focus:border-efa-red focus:outline-none"
                >
                  <option value="">Sin equipo</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({TIPO_LABEL[t.tipo]})
                    </option>
                  ))}
                </select>
              )}
              <BotonEnviar label={label} />
            </form>
          ) : (
            <span className="text-xs text-efa-ash">Sin correo</span>
          )}
        </div>
      </div>

      {state.status === "success" && (
        <div className="mt-3 rounded-md border border-green-600/40 bg-green-600/10 p-3">
          <p className="text-sm font-semibold text-green-300">{state.message}</p>
          {state.magicLink && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-efa-ash">Enlace de respaldo (por si quieres compartirlo tú):</p>
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
