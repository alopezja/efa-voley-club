import { NextResponse } from "next/server";
import { enviarRecordatoriosHoy } from "@/lib/recordatorios";

export const dynamic = "force-dynamic";

// Lo llama Vercel Cron (una vez al día). Protegido con CRON_SECRET: Vercel envía
// `Authorization: Bearer <CRON_SECRET>` cuando esa variable está configurada.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    }
  }
  const res = await enviarRecordatoriosHoy();
  return NextResponse.json({ ok: true, ...res });
}
