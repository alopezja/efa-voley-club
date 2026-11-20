"use client";

import { useActionState, useState } from "react";
import { enviarAviso, type AvisoState } from "@/app/admin/(panel)/avisos/actions";

const initial: AvisoState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone focus:border-efa-red focus:outline-none";

type TeamPick = { id: string; nombre: string };
type PlayerPick = { id: string; nombre: string };

export function AvisoForm({ teams, players }: { teams: TeamPick[]; players: PlayerPick[] }) {
  const [state, action, pending] = useActionState(enviarAviso, initial);
  const [destino, setDestino] = useState(state.values?.destino ?? "todos");

  return (
    <form action={action} className="max-w-xl space-y-5">
      {state.status === "success" && (
        <p role="status" className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-400">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="rounded-md border border-efa-red/40 bg-efa-red/10 px-4 py-3 text-sm text-efa-red">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="destino" className="text-sm font-semibold text-efa-bone">Enviar a</label>
        <select
          id="destino"
          name="destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className={inputClass}
        >
          <option value="todos">Todos los jugadores</option>
          <option value="equipo">Un equipo</option>
          <option value="jugador">Un jugador</option>
        </select>
      </div>

      {destino === "equipo" && (
        <div>
          <label htmlFor="teamId" className="text-sm font-semibold text-efa-bone">Equipo</label>
          <select id="teamId" name="teamId" defaultValue={state.values?.teamId ?? ""} className={inputClass}>
            <option value="" disabled>Elige un equipo…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {destino === "jugador" && (
        <div>
          <label htmlFor="playerId" className="text-sm font-semibold text-efa-bone">Jugador</label>
          <select id="playerId" name="playerId" defaultValue={state.values?.playerId ?? ""} className={inputClass}>
            <option value="" disabled>Elige un jugador…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="titulo" className="text-sm font-semibold text-efa-bone">Título</label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          defaultValue={state.values?.titulo}
          placeholder="Ej: Cambio de cancha el viernes"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cuerpo" className="text-sm font-semibold text-efa-bone">Mensaje (opcional)</label>
        <textarea
          id="cuerpo"
          name="cuerpo"
          rows={4}
          defaultValue={state.values?.cuerpo}
          placeholder="Detalle del aviso…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="url" className="text-sm font-semibold text-efa-bone">Enlace (opcional)</label>
        <input
          id="url"
          name="url"
          type="text"
          defaultValue={state.values?.url}
          placeholder="/jugador  o  https://…"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-efa-ash">Al tocar el aviso, el jugador irá a este enlace.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-efa-red px-6 py-2.5 text-sm font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar aviso"}
      </button>
    </form>
  );
}
