import { NextResponse } from "next/server";
import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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

// Verifica el enlace mágico (token_hash) y enruta por rol (o al `next` si viene).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "magiclink";
  const next = searchParams.get("next");

  if (token_hash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (next && next.startsWith("/")) return NextResponse.redirect(`${origin}${next}`);
      return NextResponse.redirect(await destino(supabase, origin));
    }
  }

  return NextResponse.redirect(`${origin}/acceso?error=enlace`);
}
