"use client";

import { useEffect, useState } from "react";
import { guardarSuscripcion, borrarSuscripcion } from "@/app/jugador/push-actions";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Estado = "cargando" | "no-soportado" | "activo" | "inactivo" | "bloqueado";

export function PushToggle() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      !VAPID
    ) {
      setEstado("no-soportado");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (Notification.permission === "denied") setEstado("bloqueado");
        else setEstado(sub ? "activo" : "inactivo");
      } catch {
        setEstado("no-soportado");
      }
    })();
  }, []);

  async function activar() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setEstado(perm === "denied" ? "bloqueado" : "inactivo");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID as string) as BufferSource,
      });
      const j = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      if (j.endpoint && j.keys?.p256dh && j.keys?.auth) {
        await guardarSuscripcion({ endpoint: j.endpoint, keys: { p256dh: j.keys.p256dh, auth: j.keys.auth } });
        setEstado("activo");
      }
    } catch {
      /* no-op */
    }
    setBusy(false);
  }

  async function desactivar() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await borrarSuscripcion(sub.endpoint);
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch {
      /* no-op */
    }
    setBusy(false);
  }

  if (estado === "cargando" || estado === "no-soportado") return null;

  return (
    <section className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-5">
      <h2 className="text-xl text-efa-bone">🔔 Notificaciones</h2>
      {estado === "activo" ? (
        <>
          <p className="mb-3 mt-1 text-sm text-efa-ash">Estás recibiendo avisos del club.</p>
          <button
            onClick={desactivar}
            disabled={busy}
            className="w-full rounded-md border border-efa-ash/50 px-4 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red disabled:opacity-60"
          >
            {busy ? "…" : "Desactivar"}
          </button>
        </>
      ) : estado === "bloqueado" ? (
        <p className="mt-1 text-sm text-efa-ash">
          Están bloqueadas en tu navegador. Actívalas desde los ajustes del sitio (ícono 🔒 junto a la dirección).
        </p>
      ) : (
        <>
          <p className="mb-3 mt-1 text-sm text-efa-ash">
            Entérate al instante cuando te convoquen o haya juego.
          </p>
          <button
            onClick={activar}
            disabled={busy}
            className="w-full rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Activando…" : "Activar notificaciones"}
          </button>
        </>
      )}
    </section>
  );
}
