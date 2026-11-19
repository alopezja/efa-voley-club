import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SeccionKey } from "@/lib/permisos";

export type Rol = "super_admin" | "admin" | "jugador";

export type Perfil = {
  id: string;
  nombre: string | null;
  email: string | null;
  role: Rol;
  permisos: string[];
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

// Carga el perfil del usuario autenticado (o null).
export async function getPerfil(): Promise<Perfil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nombre, email, role, permisos")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    nombre: data.nombre ?? null,
    email: data.email ?? user.email ?? null,
    role: (data.role as Rol) ?? "jugador",
    permisos: (data.permisos as string[]) ?? [],
  };
}

export function esAdmin(perfil: Pick<Perfil, "role">): boolean {
  return perfil.role === "admin" || perfil.role === "super_admin";
}

export function puede(perfil: Pick<Perfil, "role" | "permisos">, seccion: SeccionKey): boolean {
  if (perfil.role === "super_admin") return true;
  if (perfil.role !== "admin") return false;
  return (perfil.permisos ?? []).includes(seccion);
}

// Exige un admin (o super_admin). Jugadores y anónimos no entran al panel.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nombre, email, role, permisos")
    .eq("id", user.id)
    .maybeSingle();

  const perfil: Perfil | null = profile
    ? {
        id: profile.id,
        nombre: profile.nombre ?? null,
        email: profile.email ?? user.email ?? null,
        role: (profile.role as Rol) ?? "jugador",
        permisos: (profile.permisos as string[]) ?? [],
      }
    : null;

  if (!perfil || !esAdmin(perfil)) redirect("/");

  return { user, profile: perfil };
}

// Exige una sesión de jugador. Admins se mandan a su panel; anónimos a /acceso.
export async function requireJugador() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nombre, email, role, permisos")
    .eq("id", user.id)
    .maybeSingle();

  const role = ((profile?.role as Rol) ?? "jugador") as Rol;
  if (role === "admin" || role === "super_admin") redirect("/admin");

  return { user };
}

// Exige el super administrador.
export async function requireSuperAdmin() {
  const { user, profile } = await requireAdmin();
  if (profile.role !== "super_admin") redirect("/admin");
  return { user, profile };
}

// Exige permiso sobre una sección concreta del panel.
export async function requirePerm(seccion: SeccionKey) {
  const { user, profile } = await requireAdmin();
  if (!puede(profile, seccion)) redirect("/admin");
  return { user, profile };
}
