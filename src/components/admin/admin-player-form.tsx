"use client";

import { useState } from "react";
import { CourtPositions } from "@/components/jugador/court-positions";
import { ExperienceSlider } from "@/components/jugador/experience-slider";
import { guardarJugadorAdmin, type AdminPlayerState } from "@/app/admin/(panel)/jugadores/[id]/edit-actions";
import type { PlayerDetalle } from "@/lib/players";

export type MembershipView = { teamId: string; nombre: string; tipoLabel: string; numero: number | null };

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-base text-efa-bone placeholder:text-efa-ash/60 focus:border-efa-red focus:outline-none";
const label = "mb-1 block text-sm font-semibold text-efa-bone";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm font-semibold text-efa-red">{msg}</p> : null;
}

export function AdminPlayerForm({
  player,
  memberships,
  dias,
}: {
  player: PlayerDetalle;
  memberships: MembershipView[];
  dias: string[];
}) {
  const [msg, setMsg] = useState<AdminPlayerState | null>(null);
  const [sending, setSending] = useState(false);
  const [quiere, setQuiere] = useState<boolean | null>(player.quiere_camiseta);
  const errors = msg?.errors ?? {};

  // onSubmit (no `action={fn}`) para que React no resetee el formulario y no se borren los campos.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const r = await guardarJugadorAdmin({ status: "idle" }, formData);
      setMsg(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={player.id} />

      {msg && msg.status !== "idle" && (
        <p
          className={`rounded-md border p-3 text-sm font-semibold ${
            msg.status === "success"
              ? "border-green-600/40 bg-green-600/10 text-green-300"
              : "border-efa-red/40 bg-efa-red/10 text-efa-red"
          }`}
        >
          {msg.message}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nombre</label>
          <input name="nombre" defaultValue={player.nombre} className={input} />
          <Err msg={errors.nombre} />
        </div>
        <div>
          <label className={label}>Apellido</label>
          <input name="apellido" defaultValue={player.apellido} className={input} />
          <Err msg={errors.apellido} />
        </div>
        <div>
          <label className={label}>Correo</label>
          <input name="email" type="email" defaultValue={player.email ?? ""} className={input} />
          <Err msg={errors.email} />
        </div>
        <div>
          <label className={label}>Teléfono</label>
          <input name="telefono" defaultValue={player.telefono ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Fecha de nacimiento</label>
          <input name="fecha_nacimiento" type="date" defaultValue={player.fecha_nacimiento ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Mano dominante</label>
          <select name="mano_dominante" defaultValue={player.mano_dominante ?? ""} className={input}>
            <option value="">—</option>
            <option value="diestro">Diestro</option>
            <option value="zurdo">Zurdo</option>
            <option value="no_se">No sé</option>
          </select>
        </div>
      </section>

      <section>
        <CourtPositions defaultValue={player.posiciones ?? []} />
        <Err msg={errors.posiciones} />
      </section>

      <section>
        <ExperienceSlider defaultValue={player.experiencia} />
        <Err msg={errors.experiencia} />
      </section>

      {memberships.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-efa-bone">Número por equipo</p>
          {memberships.map((m) => (
            <div key={m.teamId}>
              <label className="mb-1 block text-sm text-efa-ash">
                {m.nombre} ({m.tipoLabel})
              </label>
              <input
                name={`numero_${m.teamId}`}
                type="number"
                min={1}
                max={99}
                defaultValue={m.numero ?? undefined}
                placeholder="1–99"
                className={input}
              />
              <Err msg={errors[`numero_${m.teamId}`]} />
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <p className="text-sm font-semibold text-efa-bone">¿Quiere camiseta?</p>
        <div className="flex gap-4">
          {[
            { v: "si", l: "Sí" },
            { v: "no", l: "No" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-efa-bone">
              <input
                type="radio"
                name="quiere_camiseta"
                value={o.v}
                defaultChecked={quiere === (o.v === "si")}
                onChange={() => setQuiere(o.v === "si")}
                className="h-4 w-4 accent-efa-red"
              />
              {o.l}
            </label>
          ))}
        </div>
        {quiere === true && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <select name="camiseta_color" defaultValue={player.camiseta_color ?? ""} className={input}>
              <option value="">Color…</option>
              <option value="roja">Roja</option>
              <option value="negra">Negra</option>
              <option value="ambas">Ambas</option>
            </select>
            <select name="camiseta_talla" defaultValue={player.camiseta_talla ?? ""} className={input}>
              <option value="">Talla…</option>
              {["XS", "S", "M", "L", "XL", "XXL"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input name="apodo" defaultValue={player.apodo ?? ""} placeholder="Apodo" className={input} />
          </div>
        )}
        <Err msg={errors.camiseta} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>EPS / seguro</label>
          <input name="eps" defaultValue={player.eps ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Contacto de emergencia</label>
          <input name="contacto_emergencia" defaultValue={player.contacto_emergencia ?? ""} className={input} />
        </div>
      </section>

      <section>
        <p className={label}>Disponibilidad</p>
        <div className="flex flex-wrap gap-3">
          {dias.map((d) => (
            <label key={d} className="flex items-center gap-2 rounded-md border border-efa-ash/30 px-4 py-2 text-efa-bone">
              <input
                type="checkbox"
                name="disponibilidad"
                value={d}
                defaultChecked={(player.disponibilidad ?? []).includes(d)}
                className="h-5 w-5 accent-efa-red"
              />
              {d}
            </label>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={sending}
        className="rounded-md bg-efa-red px-6 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
      >
        {sending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
