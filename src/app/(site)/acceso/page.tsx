import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPerfil, esAdmin } from "@/lib/auth";
import { AccesoForm } from "@/components/jugador/acceso-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Entra a EFA Voley Club.",
  robots: { index: false, follow: false },
};

export default async function AccesoPage() {
  // Si ya tienes sesión, te llevamos directo a tu espacio.
  const perfil = await getPerfil();
  if (perfil) redirect(esAdmin(perfil) ? "/admin" : "/jugador");

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
        <h1 className="text-3xl">Ingresar</h1>
        <p className="text-sm text-efa-ash">
          Entra con Google o con tu correo. Te llevamos a tu espacio automáticamente.
        </p>
      </div>

      <GoogleButton />

      <div className="my-5 flex items-center gap-3 text-xs text-efa-ash">
        <span className="h-px flex-1 bg-efa-ash/30" />o con tu correo<span className="h-px flex-1 bg-efa-ash/30" />
      </div>

      <AccesoForm />

      <p className="mt-6 text-center text-xs text-efa-ash">
        ¿Administrador con contraseña?{" "}
        <Link href="/admin/login" className="font-semibold text-efa-bone hover:text-efa-red">
          Entra aquí
        </Link>
      </p>
    </div>
  );
}
