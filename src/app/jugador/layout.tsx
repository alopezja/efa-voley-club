import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireJugador } from "@/lib/auth";
import { linkPlayerByEmail } from "@/lib/player-profile";

export const metadata: Metadata = {
  title: "Portal del jugador",
  robots: { index: false, follow: false },
};

export default async function JugadorLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireJugador();
  // Vincula la fila players con esta cuenta en el primer ingreso.
  await linkPlayerByEmail(user.id, user.email);

  return (
    <div className="min-h-screen bg-efa-ink text-efa-bone">
      <header className="flex items-center justify-between border-b border-efa-ash/30 px-4 py-3 sm:px-8">
        <Link href="/jugador" className="flex items-center gap-3">
          <Image src="/brand/efa-logo.jpg" alt="EFA Voley Club" width={40} height={40} className="rounded-full" />
          <span className="font-display text-lg uppercase text-efa-bone">Portal del jugador</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jugador" className="font-semibold text-efa-bone hover:text-efa-red">
            Inicio
          </Link>
          <Link href="/jugador/perfil" className="font-semibold text-efa-bone hover:text-efa-red">
            Mi perfil
          </Link>
          <Link href="/jugador/equipo" className="hidden font-semibold text-efa-bone hover:text-efa-red sm:inline">
            Mi equipo
          </Link>
          <Link href="/jugador/carne" className="hidden font-semibold text-efa-bone hover:text-efa-red sm:inline">
            Carné
          </Link>
          <form action="/jugador/logout" method="post">
            <button className="rounded-md border border-efa-ash/50 px-3 py-1.5 font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
