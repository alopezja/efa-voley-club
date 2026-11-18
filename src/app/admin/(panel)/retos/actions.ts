"use server";

import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function markChallengeRead(formData: FormData) {
  await requirePerm("retos");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb.from("challenges").update({ leido: true }).eq("id", id);
  revalidatePath("/admin/retos");
  revalidatePath("/admin");
}

export async function deleteChallenge(formData: FormData) {
  await requirePerm("retos");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb.from("challenges").delete().eq("id", id);
  revalidatePath("/admin/retos");
  revalidatePath("/admin");
}
