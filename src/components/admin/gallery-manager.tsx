"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { compressImage } from "@/lib/compress-image";
import {
  uploadPhoto,
  addYoutubeVideo,
  deleteGalleryItem,
  type GalleryActionState,
} from "@/app/admin/(panel)/galeria/actions";
import type { GalleryItem } from "@/lib/gallery";
import { youtubeId, youtubeThumb } from "@/lib/gallery-validation";

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-5 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const [tab, setTab] = useState<"foto" | "video">("foto");
  const [msg, setMsg] = useState<GalleryActionState | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function clearPreview() {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  }

  async function onPhoto(formData: FormData) {
    const f = fileRef.current?.files?.[0];
    if (f) formData.set("archivo", await compressImage(f));
    const result = await uploadPhoto({ status: "idle" }, formData);
    setMsg(result);
    if (result.status === "success") {
      if (fileRef.current) fileRef.current.value = "";
      clearPreview();
    }
  }

  async function onVideo(formData: FormData) {
    setMsg(await addYoutubeVideo({ status: "idle" }, formData));
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-5 flex gap-2">
          {(["foto", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMsg(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                tab === t ? "bg-efa-red text-efa-chalk" : "border border-efa-ash/40 text-efa-ash"
              }`}
            >
              {t === "foto" ? "Foto" : "Video (YouTube)"}
            </button>
          ))}
        </div>

        {msg?.message && (
          <p
            role="status"
            className={`mb-4 text-sm font-medium ${msg.status === "error" ? "text-efa-red" : "text-green-400"}`}
          >
            {msg.message}
          </p>
        )}

        {tab === "foto" ? (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <form action={onPhoto} className="grid gap-4">
              <input
                ref={fileRef}
                name="archivo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={onFileChange}
                className={input}
              />
              <input name="titulo" placeholder="Título (opcional)" className={input} />
              <input name="categoria" placeholder="Categoría (opcional)" className={input} />
              <textarea name="descripcion" rows={2} placeholder="Descripción (opcional)" className={input} />
              <div>
                <SubmitBtn>Subir foto</SubmitBtn>
              </div>
            </form>
            <div>
              <p className="mb-2 text-sm text-efa-ash">Vista previa</p>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-efa-ash/40 bg-black/30">
                {preview ? (
                  <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-4 text-center text-xs text-efa-ash">
                    La imagen que elijas se verá aquí antes de subirla.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form action={onVideo} className="grid max-w-xl gap-4">
            <input name="enlace" placeholder="Enlace de YouTube" required className={input} />
            <input name="titulo" placeholder="Título (opcional)" className={input} />
            <input name="categoria" placeholder="Categoría (opcional)" className={input} />
            <textarea name="descripcion" rows={2} placeholder="Descripción (opcional)" className={input} />
            <div>
              <SubmitBtn>Agregar video</SubmitBtn>
            </div>
          </form>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-2xl text-efa-bone">En la galería ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-efa-ash">Aún no hay nada. Sube la primera foto o agrega un video.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => {
              const thumb =
                it.tipo === "foto"
                  ? it.url
                  : it.enlace_youtube
                    ? youtubeThumb(youtubeId(it.enlace_youtube) ?? "")
                    : null;
              return (
                <div key={it.id} className="overflow-hidden rounded-lg border border-efa-ash/30 bg-efa-ink">
                  <div className="aspect-square bg-black/40">
                    {thumb && (
                      <img src={thumb} alt={it.titulo ?? ""} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="truncate text-xs text-efa-ash">
                      {it.titulo ?? (it.tipo === "video" ? "Video" : "Foto")}
                    </span>
                    <form action={deleteGalleryItem}>
                      <input type="hidden" name="id" value={it.id} />
                      <button type="submit" className="text-xs font-semibold text-efa-red hover:underline">
                        Borrar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
