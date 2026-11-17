import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

// Exige un usuario autenticado con fila en `profiles`; si no, redirige al login.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nombre, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/admin/login");

  return { user, profile };
}
