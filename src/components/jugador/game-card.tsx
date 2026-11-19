"use client";

import { useState } from "react";
import type { Game, Asistencia } from "@/lib/games";
import { marcarAsistencia, type AsistenciaState } from "@/app/jugador/actions";

const ZONAS = [
  { v: "tobillo", l: "Tobillo" },
  { v: "rodilla", l: "Rodilla" },
  { v: "hombro", l: "Hombro" },
  { v: "dedo", l: "Dedo / muñeca" },
  { v: "espalda", l: "Espalda" },
  { v: "otro", l: "Otro" },
];
const NIVELES = [
  { v: "leve", l: "Molestia leve" },
  { v: "lesion", l: "Lesión" },
  { v: "no_juego", l: "No puedo jugar" },
];

function fechaLabel(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00-05:00`);
  const s = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone focus:border-efa-red focus:outline-none";

export function GameCard({ game, asistencia }: { game: Game; asistencia: Asistencia | null }) {
  const [msg, setMsg] = useState<AsistenciaState | null>(null);
  const [sending, setSending] = useState(false);
  const estado = asistencia?.estado ?? null;
  const [expand, setExpand] = useState(estado === "no_voy");
  const [zona, setZona] = useState(asistencia?.molestia_zona ?? "");
  const [nivel, setNivel] = useState(asistencia?.molestia_nivel ?? "");
  const [nota, setNota] = useState(asistencia?.molestia_nota ?? "");

  async function enviar(nuevoEstado: "voy" | "no_voy") {
    setSending(true);
    const fd = new FormData();
    fd.set("tipo", game.tipo);
    fd.set("refId", game.refId);
    fd.set("fecha", game.fecha);
    fd.set("estado", nuevoEstado);
    if (nuevoEstado === "no_voy") {
      if (zona) fd.set("molestia_zona", zona);
      if (nivel) fd.set("molestia_nivel", nivel);
      if (nota) fd.set("molestia_nota", nota);
    }
    const r = await marcarAsistencia({ status: "idle" }, fd);
    setMsg(r);
    setSending(false);
  }

  const btnBase = "rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60";

  return (
    <div className="rounded-xl border border-efa-ash/30 bg-efa-ink p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="rounded bg-efa-red/15 px-2 py-0.5 text-xs font-semibold uppercase text-efa-red">
            {game.tipo === "entreno" ? "Entreno" : "Convocatoria"}
          </span>
          <p className="mt-1 text-lg font-semibold text-efa-bone">{game.titulo}</p>
          <p className="text-sm text-efa-ash">
            {fechaLabel(game.fecha)}
            {game.horaTexto ? ` · ${game.horaTexto}` : ""}
          </p>
          {game.lugar && <p className="text-sm text-efa-ash">{game.lugar}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {game.comoLlegarUrl && (
          <a href={game.comoLlegarUrl} target="_blank" rel="noopener noreferrer" className="text-efa-bone underline hover:text-efa-red">
            Cómo llegar
          </a>
        )}
        {game.calendarUrl && (
          <a href={game.calendarUrl} target="_blank" rel="noopener noreferrer" className="text-efa-bone underline hover:text-efa-red">
            Agregar a Google Calendar
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={sending}
          onClick={() => {
            setExpand(false);
            enviar("voy");
          }}
          className={`${btnBase} ${estado === "voy" ? "bg-green-600 text-white" : "border border-efa-ash/50 text-efa-bone hover:border-green-500"}`}
        >
          ✓ Voy
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => setExpand(true)}
          className={`${btnBase} ${estado === "no_voy" ? "bg-efa-red text-efa-chalk" : "border border-efa-ash/50 text-efa-bone hover:border-efa-red"}`}
        >
          ✗ No voy
        </button>
        {msg && msg.status === "success" && (
          <span className="text-sm font-semibold text-green-400">{msg.message}</span>
        )}
        {msg && msg.status === "error" && (
          <span className="text-sm font-semibold text-efa-red">{msg.message}</span>
        )}
      </div>

      {expand && (
        <div className="mt-4 space-y-3 rounded-lg border border-efa-ash/20 bg-efa-ink/60 p-3">
          <p className="text-sm font-semibold text-efa-bone">¿Tienes alguna molestia o lesión? (opcional)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select aria-label="Zona" value={zona} onChange={(e) => setZona(e.target.value)} className={input}>
              <option value="">Zona (si aplica)</option>
              {ZONAS.map((z) => (
                <option key={z.v} value={z.v}>
                  {z.l}
                </option>
              ))}
            </select>
            <select aria-label="Nivel" value={nivel} onChange={(e) => setNivel(e.target.value)} className={input}>
              <option value="">Nivel (si aplica)</option>
              {NIVELES.map((n) => (
                <option key={n.v} value={n.v}>
                  {n.l}
                </option>
              ))}
            </select>
          </div>
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota (opcional)"
            className={input}
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => enviar("no_voy")}
            className={`${btnBase} bg-efa-red text-efa-chalk hover:opacity-90`}
          >
            {sending ? "Guardando…" : "Confirmar que no voy"}
          </button>
        </div>
      )}
    </div>
  );
}
