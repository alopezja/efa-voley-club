"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  type HorarioState,
} from "@/app/admin/(panel)/horarios/actions";
import type { Schedule } from "@/lib/schedules";

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";

const initial: HorarioState = { status: "idle" };

function Campos({ s }: { s?: Schedule }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-efa-ash">
        Día
        <select name="dia" required defaultValue={s?.dia ?? ""} className={`mt-1 ${input}`}>
          <option value="" disabled>
            Elige un día…
          </option>
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-efa-ash">
        Tipo
        <select name="tipo" defaultValue={s?.tipo ?? "entrenamiento"} className={`mt-1 ${input}`}>
          <option value="entrenamiento">Entrenamiento</option>
          <option value="juego">Juego</option>
        </select>
      </label>
      <label className="text-sm text-efa-ash">
        Horario
        <input name="horario" defaultValue={s?.horario ?? ""} placeholder="8:00 – 11:00 pm" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash">
        Lugar
        <input name="lugar" defaultValue={s?.lugar ?? ""} placeholder="Cancha de Manila" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash">
        Orden
        <input name="orden" type="number" defaultValue={s?.orden ?? 0} className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash sm:col-span-2">
        Descripción (opcional)
        <input name="descripcion" defaultValue={s?.descripcion ?? ""} placeholder="Entrada por la portería norte" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash sm:col-span-2">
        Enlace de Google Maps (opcional)
        <input name="maps_url" type="url" defaultValue={s?.maps_url ?? ""} placeholder="https://maps.google.com/..." className={`mt-1 ${input}`} />
        <span className="mt-1 block text-xs text-efa-ash/70">
          El mapa de la portada usa las coordenadas del enlace, o el nombre del lugar si no las trae.
        </span>
      </label>
    </div>
  );
}

function SaveBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

function Mensaje({ state }: { state: HorarioState }) {
  if (state.status === "idle") return null;
  return (
    <span className={`text-sm font-medium ${state.status === "error" ? "text-efa-red" : "text-green-400"}`}>
      {state.message}
    </span>
  );
}

export function ScheduleRow({ s }: { s: Schedule }) {
  const [state, action] = useActionState(updateSchedule, initial);
  return (
    <div className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
      <form action={action}>
        <input type="hidden" name="id" value={s.id} />
        <Campos s={s} />
        <div className="mt-4 flex items-center gap-3">
          <SaveBtn>Guardar</SaveBtn>
          <Mensaje state={state} />
        </div>
      </form>
      <form action={deleteSchedule} className="mt-2">
        <input type="hidden" name="id" value={s.id} />
        <button type="submit" className="text-sm font-semibold text-efa-red hover:underline">
          Borrar
        </button>
      </form>
    </div>
  );
}

export function ScheduleAddForm() {
  const [state, action] = useActionState(createSchedule, initial);
  return (
    <form action={action} className="rounded-lg border border-dashed border-efa-ash/40 p-4">
      <Campos />
      <div className="mt-4 flex items-center gap-3">
        <SaveBtn>Agregar</SaveBtn>
        <Mensaje state={state} />
      </div>
    </form>
  );
}
