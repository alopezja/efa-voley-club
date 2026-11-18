"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SECCIONES } from "@/lib/permisos";
import { guardarAdmin, quitarAdmin, type EquipoState } from "@/app/admin/(panel)/equipo/actions";

export type AdminRow = {
  email: string;
  role: "super_admin" | "admin" | "jugador";
  permisos: string[];
  pendiente: boolean; // invitado pero aún no ha entrado
};

const initial: EquipoState = { status: "idle" };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-5 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar administrador"}
    </button>
  );
}

function etiquetasPermisos(keys: string[]): string {
  const labels = SECCIONES.filter((s) => keys.includes(s.key)).map((s) => s.label);
  return labels.length ? labels.join(" · ") : "Sin secciones";
}

export function EquipoManager({ filas }: { filas: AdminRow[] }) {
  const [state, action] = useActionState(guardarAdmin, initial);

  return (
    <div className="space-y-10">
      {/* Lista actual */}
      <section>
        <h2 className="mb-4 text-2xl">Equipo actual</h2>
        <div className="space-y-3">
          {filas.map((f) => (
            <div
              key={f.email}
              className="flex flex-col gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-efa-bone">
                  <span className="truncate">{f.email}</span>
                  {f.role === "super_admin" && (
                    <span className="rounded bg-efa-red/20 px-2 py-0.5 text-xs font-semibold uppercase text-efa-red">
                      Super admin
                    </span>
                  )}
                  {f.pendiente && (
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold uppercase text-yellow-300">
                      Pendiente de 1er ingreso
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-efa-ash">
                  {f.role === "super_admin" ? "Acceso total" : etiquetasPermisos(f.permisos)}
                </p>
              </div>
              {f.role !== "super_admin" && (
                <form action={quitarAdmin}>
                  <input type="hidden" name="email" value={f.email} />
                  <button
                    type="submit"
                    className="rounded-md border border-efa-ash/50 px-4 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
                  >
                    Quitar
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Agregar / actualizar */}
      <section>
        <h2 className="mb-1 text-2xl">Agregar o actualizar administrador</h2>
        <p className="mb-4 text-sm text-efa-ash">
          Escribe el correo y marca qué podrá administrar. Si ya tiene cuenta, el cambio aplica de
          inmediato; si no, quedará listo para cuando entre por primera vez (con correo o Google).
        </p>
        <form action={action} className="max-w-xl space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-efa-bone">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="persona@gmail.com"
              className="w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash/60 focus:border-efa-red focus:outline-none"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-efa-bone">Secciones que podrá administrar</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SECCIONES.map((s) => (
                <label
                  key={s.key}
                  className="flex items-center gap-3 rounded-md border border-efa-ash/30 px-4 py-3 text-base text-efa-bone hover:border-efa-red/60"
                >
                  <input
                    type="checkbox"
                    name="permisos"
                    value={s.key}
                    className="h-5 w-5 accent-efa-red"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-4">
            <BotonGuardar />
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
