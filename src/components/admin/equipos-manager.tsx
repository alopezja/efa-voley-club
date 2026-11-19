"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { TIPO_LABEL, type Team } from "@/lib/teams-types";
import { crearEquipo, eliminarEquipo, type EquipoState } from "@/app/admin/(panel)/equipos/actions";

const initial: EquipoState = { status: "idle" };

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-5 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Creando…" : "Crear equipo"}
    </button>
  );
}

export function EquiposManager({ teams }: { teams: Team[] }) {
  const [state, action] = useActionState(crearEquipo, initial);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-2xl">Equipos</h2>
        {teams.length === 0 ? (
          <p className="text-efa-ash">Aún no hay equipos. Crea el primero abajo.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-4"
              >
                <div>
                  <p className="text-lg font-semibold text-efa-bone">{t.nombre}</p>
                  <p className="text-sm text-efa-ash">
                    {TIPO_LABEL[t.tipo]} · {t.miembros} {t.miembros === 1 ? "jugador" : "jugadores"}
                  </p>
                </div>
                <form action={eliminarEquipo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-efa-ash/50 px-4 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl">Crear equipo</h2>
        <form action={action} className="max-w-md space-y-5">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-semibold text-efa-bone">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="EFA Entrenamiento"
              className="w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash/60 focus:border-efa-red focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="tipo" className="mb-1 block text-sm font-semibold text-efa-bone">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              defaultValue=""
              className="w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone focus:border-efa-red focus:outline-none"
            >
              <option value="" disabled>
                Elige…
              </option>
              <option value="entrenamiento">Entrenamiento</option>
              <option value="oficial">Oficial (torneos)</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <BotonCrear />
            {state.status === "success" && (
              <span className="text-sm font-semibold text-green-400">{state.message}</span>
            )}
            {state.status === "error" && (
              <span className="text-sm font-semibold text-efa-red">{state.message}</span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
