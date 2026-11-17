"use client";

import { useMemo, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { youtubeId, youtubeEmbedUrl, youtubeThumb } from "@/lib/gallery-validation";

function chip(active: boolean): string {
  return `rounded-full px-4 py-2 text-sm font-semibold ${
    active ? "bg-efa-red text-efa-chalk" : "border border-efa-ink/20 text-efa-ink hover:border-efa-red"
  }`;
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categorias = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoria).filter(Boolean))) as string[],
    [items]
  );
  const [filtro, setFiltro] = useState<string | null>(null);
  const [activo, setActivo] = useState<GalleryItem | null>(null);

  const visibles = filtro ? items.filter((i) => i.categoria === filtro) : items;

  return (
    <div>
      {categorias.length >= 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setFiltro(null)} className={chip(filtro === null)}>
            Todo
          </button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setFiltro(c)} className={chip(filtro === c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibles.map((it) => {
          const yt = it.enlace_youtube ? youtubeId(it.enlace_youtube) : null;
          const thumb = it.tipo === "foto" ? it.url : yt ? youtubeThumb(yt) : null;
          return (
            <button
              key={it.id}
              onClick={() => setActivo(it)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-efa-ink/80"
            >
              {thumb && (
                <img
                  src={thumb}
                  alt={it.titulo ?? ""}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
              {it.tipo === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-efa-red/90 text-efa-chalk">
                    ▶
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activo && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {activo.tipo === "foto" ? (
              <img
                src={activo.url ?? ""}
                alt={activo.titulo ?? ""}
                className="mx-auto max-h-[80vh] w-auto rounded-lg"
              />
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full rounded-lg"
                  src={youtubeEmbedUrl(youtubeId(activo.enlace_youtube ?? "") ?? "")}
                  title={activo.titulo ?? "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {(activo.titulo || activo.descripcion) && (
              <div className="mt-3 text-center text-efa-bone">
                {activo.titulo && <p className="font-display text-xl">{activo.titulo}</p>}
                {activo.descripcion && <p className="mt-1 text-sm text-efa-ash">{activo.descripcion}</p>}
              </div>
            )}
            <button
              onClick={() => setActivo(null)}
              className="mx-auto mt-4 block text-sm font-semibold text-efa-ash hover:text-efa-chalk"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
