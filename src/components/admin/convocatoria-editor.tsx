"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveConvocatoria, type ConvocatoriaState } from "@/app/admin/(panel)/convocatorias/actions";
import { compressImage } from "@/lib/compress-image";
import type { Convocatoria } from "@/lib/convocatorias";

const initial: ConvocatoriaState = { status: "idle" };

const input =
  "mt-1 w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-base text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";
const label = "block text-sm font-medium text-efa-ash";

// ISO -> value para <input type="datetime-local"> (hora local)
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-6 py-3 text-base font-semibold text-efa-chalk hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export function ConvocatoriaEditor({ convocatoria }: { convocatoria?: Convocatoria }) {
  const [state, setState] = useState<ConvocatoriaState>(initial);
  const [preview, setPreview] = useState<string | null>(convocatoria?.imagen_portada_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const err = state.errors ?? {};

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : convocatoria?.imagen_portada_url ?? null;
    });
  }

  async function onSubmit(formData: FormData) {
    const f = fileRef.current?.files?.[0];
    if (f) formData.set("imagen", await compressImage(f));
    const result = await saveConvocatoria(initial, formData);
    if (result) setState(result);
  }

  return (
    <form action={onSubmit} className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        {convocatoria && <input type="hidden" name="id" value={convocatoria.id} />}
        <input type="hidden" name="imagen_actual" value={convocatoria?.imagen_portada_url ?? ""} />

        {state.message && <p role="alert" className="text-sm font-medium text-efa-red">{state.message}</p>}

        <div>
          <label htmlFor="titulo" className={label}>Título del torneo / convocatoria</label>
          <input id="titulo" name="titulo" defaultValue={convocatoria?.titulo ?? ""} className={input} />
          {err.titulo && <p className="mt-1 text-sm text-efa-red">{err.titulo}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fecha_torneo" className={label}>Fecha y hora</label>
            <input
              id="fecha_torneo"
              name="fecha_torneo"
              type="datetime-local"
              defaultValue={toLocalInput(convocatoria?.fecha_torneo ?? null)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="categoria" className={label}>Categoría (opcional)</label>
            <input id="categoria" name="categoria" defaultValue={convocatoria?.categoria ?? ""} placeholder="Mixto, Masculino, Sub-15…" className={input} />
          </div>
        </div>

        <div>
          <label htmlFor="lugar" className={label}>Lugar (opcional)</label>
          <input id="lugar" name="lugar" defaultValue={convocatoria?.lugar ?? ""} placeholder="Coliseo, dirección…" className={input} />
        </div>

        <div>
          <label htmlFor="descripcion" className={label}>Descripción</label>
          <textarea id="descripcion" name="descripcion" rows={8} defaultValue={convocatoria?.descripcion ?? ""} className={input} />
        </div>

        <div>
          <label htmlFor="estado" className={label}>Estado</label>
          <select id="estado" name="estado" defaultValue={convocatoria?.estado ?? "borrador"} className={input}>
            <option value="borrador">Borrador (no visible)</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>

        <SaveBtn />
      </div>

      <div>
        <label htmlFor="imagen" className={label}>Imagen (opcional)</label>
        <input
          ref={fileRef}
          id="imagen"
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className={input}
        />
        {err.imagen && <p className="mt-1 text-sm text-efa-red">{err.imagen}</p>}
        <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-efa-ash/40 bg-black/30">
          {preview ? (
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-center text-xs text-efa-ash">La imagen se verá aquí.</span>
          )}
        </div>
      </div>
    </form>
  );
}
