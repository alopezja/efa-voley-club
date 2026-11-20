"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { guardarSuscripcion, borrarSuscripcion } from "@/app/jugador/push-actions";
import {
  refrescarNotificaciones,
  marcarLeida as accionMarcarLeida,
  marcarTodasLeidas as accionMarcarTodas,
  eliminarNotificacion as accionEliminar,
  type BuzonState,
} from "@/app/jugador/notif-actions";
import type { Notif } from "@/lib/notifications";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type PushEstado = "cargando" | "no-soportado" | "activo" | "inactivo" | "bloqueado";

type NotifCtx = {
  // Push del navegador
  pushEstado: PushEstado;
  pushBusy: boolean;
  activarPush: () => Promise<void>;
  desactivarPush: () => Promise<void>;
  // Buzón
  items: Notif[];
  unread: number;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodas: () => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  refrescar: () => Promise<void>;
};

const Ctx = createContext<NotifCtx | null>(null);

export function useNotif(): NotifCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNotif debe usarse dentro de <NotifProvider>");
  return c;
}

export function NotifProvider({
  initial,
  children,
}: {
  initial: BuzonState;
  children: React.ReactNode;
}) {
  const [pushEstado, setPushEstado] = useState<PushEstado>("cargando");
  const [pushBusy, setPushBusy] = useState(false);
  const [buzon, setBuzon] = useState<BuzonState>(initial);

  // Detecta soporte y estado del push al montar.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      !VAPID
    ) {
      setPushEstado("no-soportado");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (Notification.permission === "denied") setPushEstado("bloqueado");
        else setPushEstado(sub ? "activo" : "inactivo");
      } catch {
        setPushEstado("no-soportado");
      }
    })();
  }, []);

  const refrescar = useCallback(async () => {
    try {
      const fresh = await refrescarNotificaciones();
      setBuzon(fresh);
    } catch {
      /* no-op */
    }
  }, []);

  // Refresca el buzón al volver a la pestaña.
  useEffect(() => {
    const onFocus = () => refrescar();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refrescar]);

  const activarPush = useCallback(async () => {
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushEstado(perm === "denied" ? "bloqueado" : "inactivo");
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
        setPushEstado("activo");
      }
    } catch {
      /* no-op */
    } finally {
      setPushBusy(false);
    }
  }, []);

  const desactivarPush = useCallback(async () => {
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await borrarSuscripcion(sub.endpoint);
        await sub.unsubscribe();
      }
      setPushEstado("inactivo");
    } catch {
      /* no-op */
    } finally {
      setPushBusy(false);
    }
  }, []);

  const marcarLeida = useCallback(async (id: string) => {
    const fresh = await accionMarcarLeida(id);
    setBuzon(fresh);
  }, []);

  const marcarTodas = useCallback(async () => {
    const fresh = await accionMarcarTodas();
    setBuzon(fresh);
  }, []);

  const eliminar = useCallback(async (id: string) => {
    const fresh = await accionEliminar(id);
    setBuzon(fresh);
  }, []);

  const value: NotifCtx = {
    pushEstado,
    pushBusy,
    activarPush,
    desactivarPush,
    items: buzon.items,
    unread: buzon.unread,
    marcarLeida,
    marcarTodas,
    eliminar,
    refrescar,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
