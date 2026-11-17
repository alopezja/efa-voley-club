import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce a Eso Fue Adentro Voley Club: un club de la comunidad para jugar vóley por hobby, abierto a todas las edades.",
};

const categorias = [
  { titulo: "Niños y jóvenes", texto: "Un espacio para dar los primeros toques, hacer amigos y tomarle el gusto al vóley." },
  { titulo: "Adultos", texto: "¿Hace años que no juegas o nunca tuviste dónde? Este es tu lugar para volver a la cancha." },
  { titulo: "Todos los niveles", texto: "No necesitas experiencia ni condición física especial. Solo ganas de jugar." },
];

const valores = [
  { titulo: "Sin presiones", texto: "No jugamos por rendimiento, jugamos por gusto y para pasarla bien." },
  { titulo: "Comunidad", texto: "Nos acompañamos dentro y fuera de la cancha." },
  { titulo: "Abierto a todos", texto: "No importa la edad ni el nivel: aquí hay cancha para ti." },
];

export default async function NosotrosPage() {
  const c = await getSiteContent(["nosotros_titulo", "nosotros_cuerpo"]);

  return (
    <>
      <Section tone="light">
        <Container>
          <div className="max-w-2xl border-l-2 border-efa-red pl-6">
            <h1 className="text-4xl text-efa-ink sm:text-6xl">{c.nosotros_titulo}</h1>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-efa-ink/70">
              {c.nosotros_cuerpo}
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <h2 className="text-3xl text-efa-bone sm:text-4xl">Categorías</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {categorias.map((x) => (
              <div key={x.titulo} className="border-t-2 border-efa-red pt-5">
                <h3 className="text-2xl text-efa-bone">{x.titulo}</h3>
                <p className="mt-3 text-efa-ash">{x.texto}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          <h2 className="text-3xl text-efa-ink sm:text-4xl">Lo que nos mueve</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {valores.map((x) => (
              <div key={x.titulo} className="border-l-2 border-efa-red pl-6">
                <h3 className="text-2xl text-efa-ink">{x.titulo}</h3>
                <p className="mt-3 text-efa-ink/70">{x.texto}</p>
              </div>
            ))}
          </div>
          <Link
            href="/contacto"
            className="mt-12 inline-flex items-center border-b-2 border-efa-ink/30 pb-1 font-semibold text-efa-ink transition hover:border-efa-red"
          >
            Escríbenos
          </Link>
        </Container>
      </Section>
    </>
  );
}
