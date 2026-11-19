"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { compressImage } from "@/lib/compress-image";
import { CourtPositions } from "@/components/jugador/court-positions";
import { ExperienceSlider } from "@/components/jugador/experience-slider";
import { guardarPerfil, type ProfileState } from "@/app/jugador/perfil/actions";
import type { PlayerProfile } from "@/lib/player-profile";

export type MembershipView = {
  teamId: string;
  nombre: string;
  tipoLabel: string;
  numero: number | null;
  sugerido: number | null;
};

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash/60 focus:border-efa-red focus:outline-none";

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-6 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar perfil"}
    </button>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm font-semibold text-efa-red">{msg}</p>;
}

export function ProfileForm({
  player,
  memberships,
  dias,
}: {
  player: PlayerProfile;
  memberships: MembershipView[];
  dias: string[];
}) {
  const [msg, setMsg] = useState<ProfileState | null>(null);
  const [preview, setPreview] = useState<string | null>(player.foto_url);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [quiere, setQuiere] = useState<boolean | null>(player.quiere_camiseta);
  const fileRef = useRef<HTMLInputElement>(null);

  const DISPLAYABLE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFotoError(null);
    const f = e.target.files?.[0];
    setPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : player.foto_url;
    });
  }

  async function onSubmit(formData: FormData) {
    const f = fileRef.current?.files?.[0];
    if (f) {
      const comp = await compressImage(f);
      if (!DISPLAYABLE.includes(comp.type)) {
        // RAW (.dng), HEIC no decodificable, u otro formato que el navegador no muestra.
        setMsg({
          status: "error",
          message: `No pudimos usar "${f.name}". Es un formato que no se puede mostrar en la web (por ejemplo RAW/.dng de iPhone). Sube una foto JPG o PNG.`,
        });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      formData.set("foto", comp);
    } else {
      formData.delete("foto");
    }
    const result = await guardarPerfil({ status: "idle" }, formData);
    setMsg(result);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const errors = msg?.errors ?? {};

  return (
    <form action={onSubmit} className="space-y-8">
      {msg && msg.status !== "idle" && (
        <p
          className={`rounded-md border p-3 text-sm font-semibold ${
            msg.status === "success"
              ? "border-green-600/40 bg-green-600/10 text-green-300"
              : "border-efa-red/40 bg-efa-red/10 text-efa-red"
          }`}
        >
          {msg.message}
        </p>
      )}

      {/* Foto */}
      <section>
        <label htmlFor="foto" className="mb-2 block text-sm font-semibold text-efa-bone">
          Foto
        </label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-efa-ash/40 bg-efa-ink">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa"
                className="h-20 w-20 object-cover"
                onLoad={() => setFotoError(null)}
                onError={() =>
                  setFotoError(
                    "No pudimos mostrar esa imagen. Si es un RAW/.dng del iPhone, usa una foto JPG o PNG."
                  )
                }
              />
            )}
          </div>
          <input
            id="foto"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={onFileChange}
            className="text-sm text-efa-ash file:mr-3 file:rounded-md file:border-0 file:bg-efa-red file:px-4 file:py-2 file:text-sm file:font-semibold file:text-efa-chalk"
          />
        </div>
        {fotoError && <p className="mt-2 text-sm font-semibold text-efa-red">{fotoError}</p>}
      </section>

      {/* Posiciones en cancha */}
      <section>
        <CourtPositions defaultValue={player.posiciones ?? []} />
        <Err msg={errors.posiciones} />
      </section>

      {/* Experiencia */}
      <section>
        <ExperienceSlider defaultValue={player.experiencia} />
        <Err msg={errors.experiencia} />
      </section>

      {/* Números por equipo */}
      {memberships.length > 0 && (
        <section className="space-y-4">
          <p className="text-sm font-semibold text-efa-bone">Número de camiseta por equipo</p>
          {memberships.map((m) => (
            <div key={m.teamId}>
              <label htmlFor={`numero_${m.teamId}`} className="mb-1 block text-sm text-efa-ash">
                {m.nombre} ({m.tipoLabel})
              </label>
              <input
                id={`numero_${m.teamId}`}
                name={`numero_${m.teamId}`}
                type="number"
                min={1}
                max={99}
                defaultValue={m.numero ?? m.sugerido ?? undefined}
                placeholder={m.sugerido ? `Sugerido: ${m.sugerido}` : "1–99"}
                className={input}
              />
              <Err msg={errors[`numero_${m.teamId}`]} />
            </div>
          ))}
        </section>
      )}

      {/* Camiseta */}
      <section className="space-y-3">
        <p className="text-sm font-semibold text-efa-bone">¿Quieres la camiseta del club?</p>
        <div className="flex gap-4">
          {[
            { v: "si", label: "Sí" },
            { v: "no", label: "No" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-base text-efa-bone">
              <input
                type="radio"
                name="quiere_camiseta"
                value={o.v}
                defaultChecked={quiere === (o.v === "si")}
                onChange={() => setQuiere(o.v === "si")}
                className="h-4 w-4 accent-efa-red"
              />
              {o.label}
            </label>
          ))}
        </div>
        {quiere === true && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="camiseta_color" className="mb-1 block text-sm text-efa-ash">
                Color
              </label>
              <select id="camiseta_color" name="camiseta_color" defaultValue={player.camiseta_color ?? ""} className={input}>
                <option value="">Elige…</option>
                <option value="roja">Roja</option>
                <option value="negra">Negra</option>
                <option value="ambas">Ambas</option>
              </select>
            </div>
            <div>
              <label htmlFor="camiseta_talla" className="mb-1 block text-sm text-efa-ash">
                Talla
              </label>
              <select id="camiseta_talla" name="camiseta_talla" defaultValue={player.camiseta_talla ?? ""} className={input}>
                <option value="">Elige…</option>
                {["XS", "S", "M", "L", "XL", "XXL"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="apodo" className="mb-1 block text-sm text-efa-ash">
                Apodo (espalda)
              </label>
              <input id="apodo" name="apodo" defaultValue={player.apodo ?? ""} placeholder="Opcional" className={input} />
            </div>
          </div>
        )}
        <Err msg={errors.camiseta} />
      </section>

      {/* Datos */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fecha_nacimiento" className="mb-1 block text-sm font-semibold text-efa-bone">
            Fecha de nacimiento
          </label>
          <input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            defaultValue={player.fecha_nacimiento ?? ""}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="mano_dominante" className="mb-1 block text-sm font-semibold text-efa-bone">
            Mano dominante
          </label>
          <select id="mano_dominante" name="mano_dominante" defaultValue={player.mano_dominante ?? ""} className={input}>
            <option value="">Elige…</option>
            <option value="diestro">Diestro</option>
            <option value="zurdo">Zurdo</option>
            <option value="no_se">No sé</option>
          </select>
        </div>
        <div>
          <label htmlFor="eps" className="mb-1 block text-sm font-semibold text-efa-bone">
            EPS / seguro
          </label>
          <input id="eps" name="eps" defaultValue={player.eps ?? ""} placeholder="Ej: Sura" className={input} />
        </div>
        <div>
          <label htmlFor="contacto_emergencia" className="mb-1 block text-sm font-semibold text-efa-bone">
            Contacto de emergencia
          </label>
          <input
            id="contacto_emergencia"
            name="contacto_emergencia"
            defaultValue={player.contacto_emergencia ?? ""}
            placeholder="Nombre y teléfono"
            className={input}
          />
        </div>
      </section>

      {/* Disponibilidad */}
      <section>
        <p className="mb-2 text-sm font-semibold text-efa-bone">¿Qué días puedes jugar?</p>
        <div className="flex flex-wrap gap-3">
          {dias.map((d) => (
            <label
              key={d}
              className="flex items-center gap-2 rounded-md border border-efa-ash/30 px-4 py-2 text-base text-efa-bone hover:border-efa-red/60"
            >
              <input
                type="checkbox"
                name="disponibilidad"
                value={d}
                defaultChecked={(player.disponibilidad ?? []).includes(d)}
                className="h-5 w-5 accent-efa-red"
              />
              {d}
            </label>
          ))}
        </div>
      </section>

      <Guardar />
    </form>
  );
}
