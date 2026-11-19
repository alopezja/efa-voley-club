import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getPerfil, esAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const perfil = await getPerfil();
  // Solo redirige si YA es admin; si hay una sesión de jugador, mostramos el
  // formulario para que pueda iniciar sesión con la cuenta de administrador.
  if (perfil && esAdmin(perfil)) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-efa-ink px-4 py-12 text-efa-bone">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image
            src="/brand/efa-logo.jpg"
            alt="EFA Voley Club"
            width={96}
            height={96}
            className="rounded-full"
            priority
          />
          <h1 className="text-3xl">Panel del club</h1>
          <p className="text-sm text-efa-ash">Ingresa con tu correo y contraseña.</p>
        </div>
        <LoginForm />

        <div className="my-5 flex items-center gap-3 text-xs text-efa-ash">
          <span className="h-px flex-1 bg-efa-ash/30" />o<span className="h-px flex-1 bg-efa-ash/30" />
        </div>
        <GoogleButton next="/admin" />
      </div>
    </div>
  );
}
