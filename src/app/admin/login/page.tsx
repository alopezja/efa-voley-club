import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getPerfil, esAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const perfil = await getPerfil();
  if (perfil) redirect(esAdmin(perfil) ? "/admin" : "/");

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
      </div>
    </div>
  );
}
