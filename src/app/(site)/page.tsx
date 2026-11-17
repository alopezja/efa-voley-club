import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const pilares = [
  {
    titulo: "Para todas las edades",
    texto: "Desde los más chicos hasta quienes vuelven a jugar después de años. No importa la edad: lo que importa son las ganas.",
  },
  {
    titulo: "Por el gusto de jugar",
    texto: "Sin exigencias de alto rendimiento. Venimos a movernos, pasarla bien y disfrutar el vóley.",
  },
  {
    titulo: "Comunidad",
    texto: "Más que un equipo: un grupo donde hacer amigos y encontrar dónde practicar este deporte.",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-efa-ink">
        {/* Motivo: la línea de cancha y el balón que cae justo adentro */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56">
          <div className="absolute bottom-14 left-0 right-0 h-px bg-efa-chalk/30" />
          <svg
            viewBox="0 0 220 160"
            className="absolute bottom-14 left-[8%] hidden h-40 w-56 overflow-visible sm:block"
          >
            <path
              d="M10 24 Q 120 -6 150 118"
              fill="none"
              stroke="#d81f26"
              strokeWidth="2"
              strokeDasharray="3 7"
              opacity="0.7"
            />
            <circle cx="150" cy="118" r="9" fill="#d81f26" />
          </svg>
          <span className="absolute bottom-6 left-[calc(8%+150px)] hidden text-xs font-semibold uppercase tracking-wide text-efa-red sm:block">
            Adentro
          </span>
        </div>

        <Container className="relative py-20 sm:py-28">
          <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-5xl text-efa-bone sm:text-7xl">
                El vóley
                <br />
                es para
                <br />
                todos
              </h1>
              <p className="mt-6 max-w-md text-lg text-efa-ash">
                Eso Fue Adentro Voley Club — un club de la comunidad para jugar
                vóley por gusto. Niños, jóvenes y adultos: aquí hay cancha para
                todos.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  href="/registro"
                  className="inline-flex items-center rounded-sm bg-efa-red px-6 py-3 font-semibold text-white transition hover:bg-efa-red/90"
                >
                  Súmate al club
                </Link>
                <Link
                  href="/nosotros"
                  className="inline-flex items-center border-b-2 border-efa-chalk/40 pb-1 font-semibold text-efa-bone transition hover:border-efa-red"
                >
                  Conócenos
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                src="/brand/efa-logo.jpg"
                alt="Logo de Eso Fue Adentro Voley Club"
                width={420}
                height={420}
                priority
                className="w-full max-w-xs sm:max-w-sm"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* QUIÉNES SOMOS */}
      <Section tone="light">
        <Container>
          <div className="max-w-2xl border-l-2 border-efa-red pl-6">
            <h2 className="text-3xl text-efa-ink sm:text-4xl">
              Un lugar para jugar vóley
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-efa-ink/70">
              EFA es un club de la comunidad: un espacio abierto para quienes
              quieren jugar vóley por hobby. Queremos que más personas, de todas
              las edades, tengan dónde practicar, moverse y compartir.
            </p>
            <Link
              href="/nosotros"
              className="mt-6 inline-flex items-center border-b-2 border-efa-ink/30 pb-1 font-semibold text-efa-ink transition hover:border-efa-red"
            >
              Conócenos
            </Link>
          </div>
        </Container>
      </Section>

      {/* LO QUE HACEMOS */}
      <Section tone="dark">
        <Container>
          <h2 className="text-3xl text-efa-bone sm:text-4xl">Lo que hacemos</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {pilares.map((p) => (
              <div key={p.titulo} className="border-t-2 border-efa-red pt-5">
                <h3 className="text-2xl text-efa-bone">{p.titulo}</h3>
                <p className="mt-3 text-efa-ash">{p.texto}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA FINAL */}
      <section className="bg-efa-red">
        <Container className="flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-xl text-3xl text-white sm:text-4xl">
            ¿Tienes ganas de jugar?
          </h2>
          <Link
            href="/registro"
            className="inline-flex items-center rounded-sm bg-efa-ink px-7 py-3 font-semibold text-efa-bone transition hover:bg-black"
          >
            Súmate al club
          </Link>
        </Container>
      </section>
    </>
  );
}
