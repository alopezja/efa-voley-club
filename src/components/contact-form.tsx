"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/(site)/contacto/actions";

const initial: ContactState = { status: "idle" };

const inputClass =
  "mt-2 w-full border border-efa-sand bg-white/60 px-4 py-3 text-efa-ink placeholder:text-efa-ash/70 disabled:opacity-60";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="border-l-2 border-efa-red pl-6">
        <p className="font-display text-2xl uppercase text-efa-ink">
          ¡Gracias! Te responderemos pronto.
        </p>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      {state.message && (
        <p role="alert" className="border-l-2 border-efa-red pl-4 text-efa-ink">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="nombre" className="text-sm font-medium text-efa-ink">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          defaultValue={state.values?.nombre}
          disabled={pending}
          aria-invalid={!!err.nombre}
          aria-describedby={err.nombre ? "nombre-error" : undefined}
          className={inputClass}
        />
        {err.nombre && (
          <p id="nombre-error" className="mt-2 text-sm text-efa-red">
            {err.nombre}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-efa-ink">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          disabled={pending}
          aria-invalid={!!err.email}
          aria-describedby={err.email ? "email-error" : undefined}
          className={inputClass}
        />
        {err.email && (
          <p id="email-error" className="mt-2 text-sm text-efa-red">
            {err.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="mensaje" className="text-sm font-medium text-efa-ink">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={6}
          defaultValue={state.values?.mensaje}
          disabled={pending}
          aria-invalid={!!err.mensaje}
          aria-describedby={err.mensaje ? "mensaje-error" : undefined}
          className={inputClass}
        />
        {err.mensaje && (
          <p id="mensaje-error" className="mt-2 text-sm text-efa-red">
            {err.mensaje}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-efa-ink px-8 py-3 font-display uppercase tracking-wide text-efa-bone transition-colors hover:bg-efa-red disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
