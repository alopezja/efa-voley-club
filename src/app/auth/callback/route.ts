import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Destino según el rol del usuario autenticado (usa el MISMO cliente con sesión).
async function destino(supabase: SupabaseClient, origin: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return `${origin}/jugador`;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = data?.role;
  const path = role === "admin" || role === "super_admin" ? "/admin" : "/jugador";
  return `${origin}${path}`;
}

// Intercambia el código (Google / enlace mágico) por sesión y enruta por rol.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Si viene un destino específico (ej. completar perfil), se respeta; si no, se enruta por rol.
      if (next && next.startsWith("/")) return NextResponse.redirect(`${origin}${next}`);
      return NextResponse.redirect(await destino(supabase, origin));
    }
  }

  return NextResponse.redirect(`${origin}/acceso?error=enlace`);
}
