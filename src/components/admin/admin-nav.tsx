"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/lib/auth";
import { SECCIONES } from "@/lib/permisos";

export function AdminNav({
  email,
  role,
  permisos,
}: {
  email?: string | null;
  role: Rol;
  permisos: string[];
}) {
  const esSuper = role === "super_admin";
  const pathname = usePathname();

  // Dashboard activo solo exacto; las demás también en sus sub-páginas (ej. /admin/jugadores/[id]).
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  // Dashboard siempre; las secciones según permisos; Equipo solo super admin.
  const links: { href: string; label: string }[] = [{ href: "/admin", label: "Dashboard" }];
  for (const s of SECCIONES) {
    if (esSuper || permisos.includes(s.key)) links.push({ href: s.href, label: s.label });
  }
  if (esSuper) links.push({ href: "/admin/equipo", label: "Administradores" });

  return (
    <nav
      aria-label="Panel de administración"
      className="flex w-full flex-col gap-2 border-b border-efa-ash/30 bg-efa-ink p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-6"
    >
      <p className="mb-2 font-display text-xl uppercase text-efa-bone">Panel EFA</p>

      {/* Links: hacen scroll interno si no caben, sin empujar el botón de salir */}
      <div className="flex flex-col gap-2 md:min-h-0 md:flex-1 md:overflow-y-auto">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block rounded-md px-4 py-3 text-base font-semibold ${
              isActive(l.href) ? "bg-efa-red text-efa-chalk" : "text-efa-bone hover:text-efa-red"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Pie fijo: siempre visible en la base de la pantalla */}
      <div className="mt-4 shrink-0 border-t border-efa-ash/30 pt-4">
        {email && <p className="truncate text-sm text-efa-ash">{email}</p>}
        <p className="mb-3 text-xs uppercase tracking-wide text-efa-ash/70">
          {esSuper ? "Super administrador" : "Administrador"}
        </p>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-md border border-efa-ash/50 px-4 py-3 text-base font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
