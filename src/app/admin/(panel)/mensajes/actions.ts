"use server";

import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function revalidar() {
  revalidatePath("/admin/mensajes");
  revalidatePath("/admin");
}

export async function markMessageRead(formData: FormData) {
  await requirePerm("mensajes");
  const id = String(formData.get("id") ?? "");
  const leido = String(formData.get("leido") ?? "true") === "true";
  if (!id) return;
  const sb = createAdminClient();
  await sb.from("contact_messages").update({ leido }).eq("id", id);
  revalidar();
}

export async function deleteMessage(formData: FormData) {
  await requirePerm("mensajes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = createAdminClient();
  await sb.from("contact_messages").delete().eq("id", id);
  revalidar();
}
