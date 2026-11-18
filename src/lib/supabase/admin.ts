import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

// Cliente con service_role (omite RLS). Usar SOLO en server actions ya
// protegidas con requireAdmin(), para tablas sin políticas de escritura
// de admin (ej: contact_messages).
export function createAdminClient() {
  const env = serverEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
