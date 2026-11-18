import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { EquipoManager, type AdminRow } from "@/components/admin/equipo-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipo", robots: { index: false, follow: false } };

export default async function AdminEquipoPage() {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const [{ data: profiles }, { data: invites }] = await Promise.all([
    admin
      .from("profiles")
      .select("email, role, permisos")
      .in("role", ["super_admin", "admin"]),
    admin.from("admin_invites").select("email, permisos"),
  ]);

  const perfiles = profiles ?? [];
  const emailsConCuenta = new Set(
    perfiles.map((p) => (p.email ?? "").toLowerCase()).filter(Boolean)
  );

  const filas: AdminRow[] = [];

  // Admins con cuenta (incluye el super admin de primero).
  for (const p of perfiles) {
    filas.push({
      email: p.email ?? "(sin correo)",
      role: p.role as AdminRow["role"],
      permisos: (p.permisos as string[]) ?? [],
      pendiente: false,
    });
  }

  // Invitaciones de quienes aún no han ingresado.
  for (const inv of invites ?? []) {
    const email = (inv.email ?? "").toLowerCase();
    if (!email || emailsConCuenta.has(email)) continue;
    filas.push({ email, role: "admin", permisos: (inv.permisos as string[]) ?? [], pendiente: true });
  }

  filas.sort((a, b) => {
    if (a.role === "super_admin") return -1;
    if (b.role === "super_admin") return 1;
    return a.email.localeCompare(b.email);
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-4xl">Equipo</h1>
      <p className="mb-8 text-efa-ash">
        Administra quién puede entrar al panel y qué secciones puede gestionar. Esta pantalla es
        exclusiva del super administrador.
      </p>
      <EquipoManager filas={filas} />
    </div>
  );
}
