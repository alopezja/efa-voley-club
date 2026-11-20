"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotif } from "./notif-provider";
import type { Notif } from "@/lib/notifications";

const ICONO: Record<string, string> = {
  convocatoria: "📣",
  recordatorio: "🏐",
  aviso: "📌",
};

function hace(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function NotifBell() {
  const { pushEstado, pushBusy, activarPush, desactivarPush, items, unread, marcarLeida, marcarTodas, eliminar, refrescar } =
    useNotif();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Cerrar al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function abrir() {
    const siguiente = !open;
    setOpen(siguiente);
    if (siguiente) refrescar();
  }

  async function abrirNotif(n: Notif) {
    if (n.read_at == null) await marcarLeida(n.id);
    if (n.url) {
      setOpen(false);
      router.push(n.url);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={abrir}
        aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : "Notificaciones"}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-efa-ash/40 text-efa-bone transition hover:border-efa-red hover:text-efa-red"
      >
        <span aria-hidden className="text-lg leading-none">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-efa-red px-1 text-[11px] font-bold text-efa-chalk">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-efa-ash/40 bg-efa-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
          {/* Encabezado + marcar todas */}
          <div className="flex items-center justify-between border-b border-efa-ash/25 px-4 py-3">
            <p className="font-display text-sm uppercase tracking-wide text-efa-bone">Notificaciones</p>
            {unread > 0 && (
              <button
                onClick={marcarTodas}
                className="text-xs font-semibold text-efa-red hover:underline"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Control del push */}
          <div className="border-b border-efa-ash/25 bg-white/[0.02] px-4 py-3">
            {pushEstado === "activo" ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-efa-ash">Avisos en este dispositivo activados.</p>
                <button
                  onClick={desactivarPush}
                  disabled={pushBusy}
                  className="shrink-0 rounded-md border border-efa-ash/50 px-2.5 py-1 text-xs font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red disabled:opacity-60"
                >
                  {pushBusy ? "…" : "Apagar"}
                </button>
              </div>
            ) : pushEstado === "bloqueado" ? (
              <p className="text-xs text-efa-ash">
                Los avisos están bloqueados en el navegador. Actívalos desde el ícono 🔒 junto a la dirección.
              </p>
            ) : pushEstado === "no-soportado" || pushEstado === "cargando" ? (
              <p className="text-xs text-efa-ash">Avisos del navegador no disponibles aquí.</p>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-efa-ash">Recibe avisos en este dispositivo.</p>
                <button
                  onClick={activarPush}
                  disabled={pushBusy}
                  className="shrink-0 rounded-md bg-efa-red px-2.5 py-1 text-xs font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
                >
                  {pushBusy ? "…" : "Encender"}
                </button>
              </div>
            )}
          </div>

          {/* Lista */}
          <ul className="max-h-[60vh] divide-y divide-efa-ash/15 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-efa-ash">
                No tienes notificaciones todavía.
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={`group px-4 py-3 transition ${n.read_at == null ? "bg-efa-red/[0.06]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="mt-0.5 text-base leading-none">
                      {ICONO[n.tipo] ?? "📌"}
                    </span>
                    <button
                      onClick={() => abrirNotif(n)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className={`truncate text-sm ${n.read_at == null ? "font-semibold text-efa-bone" : "text-efa-bone/90"}`}>
                        {n.titulo}
                      </p>
                      {n.cuerpo && <p className="mt-0.5 line-clamp-2 text-xs text-efa-ash">{n.cuerpo}</p>}
                      <p className="mt-1 text-[11px] text-efa-ash/70">{hace(n.created_at)}</p>
                    </button>
                    {n.read_at == null && (
                      <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-efa-red" />
                    )}
                  </div>
                  <div className="mt-2 flex gap-3 pl-7 text-[11px]">
                    {n.read_at == null && (
                      <button onClick={() => marcarLeida(n.id)} className="text-efa-ash hover:text-efa-bone">
                        Marcar leída
                      </button>
                    )}
                    <button onClick={() => eliminar(n.id)} className="text-efa-ash hover:text-efa-red">
                      Eliminar
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
