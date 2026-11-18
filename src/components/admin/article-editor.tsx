"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveArticle, type ArticleState } from "@/app/admin/(panel)/noticias/actions";
import { compressImage } from "@/lib/compress-image";
import type { Article } from "@/lib/articles";

const initial: ArticleState = { status: "idle" };

const input =
  "mt-1 w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-base text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";
const label = "block text-sm font-medium text-efa-ash";

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

export function ArticleEditor({ article }: { article?: Article }) {
  const [state, setState] = useState<ArticleState>(initial);
  const [preview, setPreview] = useState<string | null>(article?.imagen_portada_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const err = state.errors ?? {};

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : article?.imagen_portada_url ?? null;
    });
  }

  // Acción de formulario (React la envuelve en una transición). Comprime la imagen
  // antes de enviar; en éxito saveArticle redirige, en error devuelve el estado.
  async function onSubmit(formData: FormData) {
    const f = fileRef.current?.files?.[0];
    if (f) formData.set("imagen", await compressImage(f));
    const result = await saveArticle(initial, formData);
    if (result) setState(result);
  }

  return (
    <form action={onSubmit} className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        {article && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="imagen_actual" value={article?.imagen_portada_url ?? ""} />

        {state.message && <p role="alert" className="text-sm font-medium text-efa-red">{state.message}</p>}

        <div>
          <label htmlFor="titulo" className={label}>Título</label>
          <input id="titulo" name="titulo" defaultValue={article?.titulo ?? ""} className={input} />
          {err.titulo && <p className="mt-1 text-sm text-efa-red">{err.titulo}</p>}
        </div>

        <div>
          <label htmlFor="resumen" className={label}>Resumen (aparece en el listado)</label>
          <textarea id="resumen" name="resumen" rows={2} defaultValue={article?.resumen ?? ""} className={input} />
        </div>

        <div>
          <label htmlFor="cuerpo" className={label}>Contenido</label>
          <textarea id="cuerpo" name="cuerpo" rows={12} defaultValue={article?.cuerpo ?? ""} className={input} />
          {err.cuerpo && <p className="mt-1 text-sm text-efa-red">{err.cuerpo}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="autor" className={label}>Autor (opcional)</label>
            <input id="autor" name="autor" defaultValue={article?.autor ?? ""} className={input} />
          </div>
          <div>
            <label htmlFor="estado" className={label}>Estado</label>
            <select id="estado" name="estado" defaultValue={article?.estado ?? "borrador"} className={input}>
              <option value="borrador">Borrador (no visible)</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
        </div>

        <SaveBtn />
      </div>

      <div>
        <label htmlFor="imagen" className={label}>Imagen de portada</label>
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
            <span className="px-4 text-center text-xs text-efa-ash">La portada se verá aquí.</span>
          )}
        </div>
      </div>
    </form>
  );
}
