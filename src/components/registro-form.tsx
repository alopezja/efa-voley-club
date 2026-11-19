"use client";

import { useActionState, useEffect, useRef } from "react";
import { registerPlayer, type RegistroState } from "@/app/(site)/registro/actions";

const initial: RegistroState = { status: "idle" };

const inputClass =
  "mt-2 w-full border border-efa-sand bg-white/60 px-4 py-3 text-efa-ink placeholder:text-efa-ash/70 disabled:opacity-60";

export function RegistroForm() {
  const [state, action, pending] = useActionState(registerPlayer, initial);
  const topRef = useRef<HTMLElement | null>(null);
  const setTop = (el: HTMLElement | null) => {
    topRef.current = el;
  };

  // Al enviar (éxito o error), lleva la vista a la confirmación/mensaje.
  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={setTop} role="status" className="scroll-mt-24 border-l-2 border-efa-red pl-6">
        <p className="font-display text-2xl uppercase text-efa-ink">¡Listo! Te registraste.</p>
        <p className="mt-2 text-efa-ink/70">
          Revisaremos tu registro y te contactaremos para darte la bienvenida al club.
        </p>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form ref={setTop} action={action} noValidate className="scroll-mt-24 space-y-6">
      {state.message && (
        <p role="alert" className="border-l-2 border-efa-red pl-4 text-efa-ink">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-efa-ink">Nombre</label>
          <input id="nombre" name="nombre" type="text" autoComplete="given-name"
            defaultValue={state.values?.nombre} disabled={pending}
            aria-invalid={!!err.nombre} className={inputClass} />
          {err.nombre && <p className="mt-2 text-sm text-efa-red">{err.nombre}</p>}
        </div>
        <div>
          <label htmlFor="apellido" className="text-sm font-medium text-efa-ink">Apellido</label>
          <input id="apellido" name="apellido" type="text" autoComplete="family-name"
            defaultValue={state.values?.apellido} disabled={pending}
            aria-invalid={!!err.apellido} className={inputClass} />
          {err.apellido && <p className="mt-2 text-sm text-efa-red">{err.apellido}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-efa-ink">Correo</label>
          <input id="email" name="email" type="email" autoComplete="email"
            defaultValue={state.values?.email} disabled={pending}
            aria-invalid={!!err.email} className={inputClass} />
          {err.email && <p className="mt-2 text-sm text-efa-red">{err.email}</p>}
        </div>
        <div>
          <label htmlFor="telefono" className="text-sm font-medium text-efa-ink">Teléfono / WhatsApp</label>
          <input id="telefono" name="telefono" type="tel" autoComplete="tel"
            defaultValue={state.values?.telefono} disabled={pending} className={inputClass} />
        </div>
      </div>

      {err.contacto && <p className="text-sm text-efa-red">{err.contacto}</p>}

      <button type="submit" disabled={pending}
        className="bg-efa-ink px-8 py-3 font-display uppercase tracking-wide text-efa-bone transition-colors hover:bg-efa-red disabled:opacity-60">
        {pending ? "Enviando…" : "Registrarme"}
      </button>
    </form>
  );
}
