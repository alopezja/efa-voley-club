import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlayerMemberships, type Membership } from "@/lib/teams";
import { computeCompleteness, type Completeness, type CompletenessInput } from "@/lib/profile-completeness";

export type PlayerProfile = {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  estado: string;
  foto_url: string | null;
  posiciones: string[];
  experiencia: number | null;
  fecha_nacimiento: string | null;
  eps: string | null;
  contacto_emergencia: string | null;
  mano_dominante: string | null;
  disponibilidad: string[];
  quiere_camiseta: boolean | null;
  camiseta_color: string | null;
  camiseta_talla: string | null;
  apodo: string | null;
  perfil_completo_at: string | null;
};

const SELECT =
  "id, nombre, apellido, email, telefono, estado, foto_url, posiciones, experiencia, fecha_nacimiento, eps, contacto_emergencia, mano_dominante, disponibilidad, quiere_camiseta, camiseta_color, camiseta_talla, apodo, perfil_completo_at";

// Enlaza la fila players (por correo) con el usuario de auth en el primer ingreso.
export async function linkPlayerByEmail(userId: string, email?: string | null): Promise<void> {
  if (!email) return;
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return; // ya vinculado

    const { data: match } = await admin
      .from("players")
      .select("id")
      .ilike("email", email)
      .is("user_id", null)
      .limit(1)
      .maybeSingle();
    if (match) {
      await admin.from("players").update({ user_id: userId }).eq("id", match.id);
    }
  } catch {
    // best-effort
  }
}

export async function getMiPlayer(userId: string): Promise<PlayerProfile | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("players").select(SELECT).eq("user_id", userId).maybeSingle();
    return (data as PlayerProfile) ?? null;
  } catch {
    return null;
  }
}

export function toCompletenessInput(p: PlayerProfile, memberships: Membership[]): CompletenessInput {
  const tieneNumero = memberships.some((m) => m.numero != null);
  return {
    foto_url: p.foto_url,
    posiciones: p.posiciones ?? [],
    experiencia: p.experiencia,
    fecha_nacimiento: p.fecha_nacimiento,
    eps: p.eps,
    contacto_emergencia: p.contacto_emergencia,
    mano_dominante: p.mano_dominante,
    disponibilidad: p.disponibilidad ?? [],
    quiere_camiseta: p.quiere_camiseta,
    camiseta_color: p.camiseta_color,
    camiseta_talla: p.camiseta_talla,
    tieneNumero,
  };
}

export async function getMiCompletitud(
  p: PlayerProfile
): Promise<{ completeness: Completeness; memberships: Membership[] }> {
  const memberships = await getPlayerMemberships(p.id);
  return { completeness: computeCompleteness(toCompletenessInput(p, memberships)), memberships };
}
