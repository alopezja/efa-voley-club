import type { Metadata } from "next";
import Image from "next/image";
import { AccesoForm } from "@/components/jugador/acceso-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Acceso jugadores",
  description: "Entra a tu perfil de jugador de EFA Voley Club.",
  robots: { index: false, follow: false },
};

export default function AccesoPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image
          src="/brand/efa-logo.jpg"
          alt="EFA Voley Club"
          width={88}
          height={88}
          className="rounded-full"
          priority
        />
        <h1 className="text-3xl">Portal del jugador</h1>
        <p className="text-sm text-efa-ash">
          Escribe tu correo y te enviamos un enlace para entrar sin contraseña.
        </p>
      </div>
      <AccesoForm />

      <div className="my-5 flex items-center gap-3 text-xs text-efa-ash">
        <span className="h-px flex-1 bg-efa-ash/30" />o<span className="h-px flex-1 bg-efa-ash/30" />
      </div>
      <GoogleButton next="/jugador" />
    </div>
  );
}
