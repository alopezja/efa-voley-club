import { createClient } from "@/lib/supabase/server";

export type ContactMessage = {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
};

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("contact_messages")
      .select("id,nombre,email,mensaje,leido,created_at")
      .order("created_at", { ascending: false });
    return (data as ContactMessage[]) ?? [];
  } catch {
    return [];
  }
}
