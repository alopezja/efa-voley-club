import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Intercambia el código del enlace mágico (o de Google, en la Parte 2) por una
// sesión, y redirige a `next` (por defecto el portal del jugador).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/jugador";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/acceso?error=enlace`);
}
