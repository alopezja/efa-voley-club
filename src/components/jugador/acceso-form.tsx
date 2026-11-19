"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enviarEnlace, type AccesoState } from "@/app/(site)/acceso/actions";

const initial: AccesoState = { status: "idle" };

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-efa-red px-5 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Enviar enlace de acceso"}
    </button>
  );
}

export function AccesoForm() {
  const [state, action] = useActionState(enviarEnlace, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-efa-bone">
          Tu correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tucorreo@gmail.com"
          className="w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash/60 focus:border-efa-red focus:outline-none"
        />
      </div>
      <Boton />
      {state.status === "success" && (
        <p className="rounded-md border border-green-600/40 bg-green-600/10 p-3 text-sm font-semibold text-green-300">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="text-sm font-semibold text-efa-red">{state.message}</p>
      )}
    </form>
  );
}
