"use client";

import { useActionState } from "react";
import { sendChallenge, type ChallengeState } from "@/app/(site)/retar/actions";
import { CATEGORIAS } from "@/lib/challenge-validation";

const initial: ChallengeState = { status: "idle" };

const inputClass =
  "mt-2 w-full border border-efa-sand bg-white/60 px-4 py-3 text-efa-ink placeholder:text-efa-ash/70 disabled:opacity-60";

export function ChallengeForm({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [state, action, pending] = useActionState(sendChallenge, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="border-l-2 border-efa-red pl-6">
        <p className="font-display text-2xl uppercase text-efa-ink">¡Reto recibido!</p>
        <p className="mt-2 text-efa-ink/70">Nos pondremos en contacto para cuadrar el partido. 🏐</p>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      {state.message && (
        <p role="alert" className="border-l-2 border-efa-red pl-4 text-efa-ink">{state.message}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-efa-ink">Tu nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={state.values?.nombre}
            disabled={pending} aria-invalid={!!err.nombre} className={inputClass} />
          {err.nombre && <p className="mt-2 text-sm text-efa-red">{err.nombre}</p>}
        </div>
        <div>
          <label htmlFor="equipo" className="text-sm font-medium text-efa-ink">Equipo (opcional)</label>
          <input id="equipo" name="equipo" type="text" defaultValue={state.values?.equipo}
            disabled={pending} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="categoria" className="text-sm font-medium text-efa-ink">Categoría del partido</label>
        <select id="categoria" name="categoria" defaultValue={state.values?.categoria ?? ""}
          disabled={pending} aria-invalid={!!err.categoria} className={inputClass}>
          <option value="" disabled>Elige una…</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {err.categoria && <p className="mt-2 text-sm text-efa-red">{err.categoria}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-efa-ink">Correo</label>
          <input id="email" name="email" type="email" defaultValue={state.values?.email}
            disabled={pending} aria-invalid={!!err.email} className={inputClass} />
          {err.email && <p className="mt-2 text-sm text-efa-red">{err.email}</p>}
        </div>
        <div>
          <label htmlFor="telefono" className="text-sm font-medium text-efa-ink">Teléfono / WhatsApp</label>
          <input id="telefono" name="telefono" type="tel" defaultValue={state.values?.telefono}
            disabled={pending} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fecha_propuesta" className="text-sm font-medium text-efa-ink">Fecha/hora propuesta (opcional)</label>
          <input id="fecha_propuesta" name="fecha_propuesta" type="text" placeholder="Ej: sábado por la tarde"
            defaultValue={state.values?.fecha_propuesta} disabled={pending} className={inputClass} />
        </div>
        <div>
          <label htmlFor="lugar" className="text-sm font-medium text-efa-ink">Lugar propuesto (opcional)</label>
          <input id="lugar" name="lugar" type="text" defaultValue={state.values?.lugar}
            disabled={pending} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="text-sm font-medium text-efa-ink">Mensaje (opcional)</label>
        <textarea id="mensaje" name="mensaje" rows={4} defaultValue={state.values?.mensaje}
          disabled={pending} className={inputClass} />
      </div>

      {err.contacto && <p className="text-sm text-efa-red">{err.contacto}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending}
          className="bg-efa-ink px-8 py-3 font-display uppercase tracking-wide text-efa-bone transition-colors hover:bg-efa-red disabled:opacity-60">
          {pending ? "Enviando…" : "Enviar reto"}
        </button>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="font-semibold text-efa-ink underline decoration-efa-red decoration-2 underline-offset-4 hover:text-efa-red">
            O rétanos por WhatsApp
          </a>
        )}
      </div>
    </form>
  );
}
