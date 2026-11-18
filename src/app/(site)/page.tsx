import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getGalleryItems } from "@/lib/gallery";
import { youtubeId, youtubeThumb } from "@/lib/gallery-validation";
import { getSchedules, mapEmbedSrc } from "@/lib/schedules";
import { getPublishedArticles } from "@/lib/articles";
import { getUpcomingConvocatorias } from "@/lib/convocatorias";

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

const pasos = [
  { n: "1", titulo: "Regístrate", texto: "Déjanos tus datos en el formulario de la web." },
  { n: "2", titulo: "Te contactamos", texto: "Te escribimos para darte la bienvenida y contarte los detalles." },
  { n: "3", titulo: "Ven a jugar", texto: "Te esperamos en la cancha. ¡Eso fue adentro!" },
];

export default async function Home() {
  const [galeria, horarios, noticias, convocatorias] = await Promise.all([
    getGalleryItems().then((g) => g.slice(0, 6)),
    getSchedules().then((h) => h.slice(0, 2)),
    getPublishedArticles(3),
    getUpcomingConvocatorias(2),
  ]);

  const fechaCorta = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
    } catch {
      return "";
    }
  };
  const fechaConvo = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short" }).format(new Date(iso));
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-efa-ink">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56">
          <div className="absolute bottom-14 left-0 right-0 h-px bg-efa-chalk/30" />
          <svg
            viewBox="0 0 220 160"
            className="absolute bottom-14 left-[8%] hidden h-40 w-56 overflow-visible sm:block"
          >
            <path d="M10 24 Q 120 -6 150 118" fill="none" stroke="#d81f26" strokeWidth="2" strokeDasharray="3 7" opacity="0.7" />
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
                Eso Fue Adentro Voley Club — un club de la comunidad para jugar vóley por gusto.
                Niños, jóvenes y adultos: aquí hay cancha para todos.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  href="/registro"
                  className="inline-flex items-center rounded-sm bg-efa-red px-6 py-3 font-semibold text-white transition hover:bg-efa-red/90"
                >
                  Súmate al club
                </Link>
                <Link
                  href="/retar"
                  className="inline-flex items-center border-b-2 border-efa-chalk/40 pb-1 font-semibold text-efa-bone transition hover:border-efa-red"
                >
                  Rétanos a jugar
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
            <h2 className="text-3xl text-efa-ink sm:text-4xl">Un lugar para jugar vóley</h2>
            <p className="mt-5 text-lg leading-relaxed text-efa-ink/70">
              EFA es un club de la comunidad: un espacio abierto para quienes quieren jugar vóley por
              hobby. Queremos que más personas, de todas las edades, tengan dónde practicar, moverse y
              compartir.
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

      {/* PRÓXIMAS CONVOCATORIAS */}
      {convocatorias.length > 0 && (
        <Section tone="dark">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl text-efa-bone sm:text-4xl">Próximas convocatorias</h2>
              <Link
                href="/convocatorias"
                className="border-b-2 border-efa-chalk/30 pb-1 font-semibold text-efa-bone transition hover:border-efa-red"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {convocatorias.map((c) => (
                <Link
                  key={c.id}
                  href={`/convocatorias/${c.slug}`}
                  className="group rounded-lg border border-efa-ash/30 p-6 transition hover:border-efa-red"
                >
                  {c.fecha_torneo && (
                    <p className="text-xs uppercase tracking-wide text-efa-red">{fechaConvo(c.fecha_torneo)}</p>
                  )}
                  <h3 className="mt-2 font-display text-2xl uppercase leading-tight text-efa-bone">{c.titulo}</h3>
                  <p className="mt-1 text-sm text-efa-ash">{[c.lugar, c.categoria].filter(Boolean).join(" · ")}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-efa-red">Ver convocatoria →</span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ÚLTIMAS NOTICIAS */}
      {noticias.length > 0 && (
        <Section tone="light">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl text-efa-ink sm:text-4xl">Últimas noticias</h2>
              <Link
                href="/noticias"
                className="border-b-2 border-efa-ink/30 pb-1 font-semibold text-efa-ink transition hover:border-efa-red"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {noticias.map((a) => (
                <Link
                  key={a.id}
                  href={`/noticias/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-efa-sand bg-white/40 transition hover:border-efa-red"
                >
                  <div className="aspect-video overflow-hidden bg-efa-sand">
                    {a.imagen_portada_url && (
                      <img
                        src={a.imagen_portada_url}
                        alt={a.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs uppercase tracking-wide text-efa-ash">
                      {fechaCorta(a.fecha_publicacion ?? a.created_at)}
                    </p>
                    <h3 className="mt-2 font-display text-xl uppercase leading-tight text-efa-ink">{a.titulo}</h3>
                    {a.resumen && <p className="mt-2 line-clamp-2 text-sm text-efa-ink/70">{a.resumen}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CÓMO SUMARTE */}
      <Section tone="light">
        <Container>
          <h2 className="text-3xl text-efa-ink sm:text-4xl">Cómo sumarte</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.n} className="flex gap-4">
                <span className="font-display text-5xl leading-none text-efa-red">{p.n}</span>
                <div>
                  <h3 className="text-xl text-efa-ink">{p.titulo}</h3>
                  <p className="mt-2 text-efa-ink/70">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/registro"
            className="mt-10 inline-flex items-center rounded-sm bg-efa-ink px-6 py-3 font-semibold text-efa-bone transition hover:bg-efa-red"
          >
            Quiero registrarme
          </Link>
        </Container>
      </Section>

      {/* DÓNDE Y CUÁNDO */}
      {horarios.length > 0 && (
        <Section tone="dark">
          <Container>
            <h2 className="text-3xl text-efa-bone sm:text-4xl">Dónde y cuándo jugamos</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {horarios.map((h) => {
                const mapa = mapEmbedSrc(h);
                return (
                  <div
                    key={h.id}
                    className="grid overflow-hidden rounded-lg border border-efa-ash/30 sm:grid-cols-[1fr_220px]"
                  >
                    <div className="p-6">
                      <p className="font-display text-2xl uppercase text-efa-red">{h.dia}</p>
                      {h.lugar && <p className="mt-2 text-xl text-efa-bone">{h.lugar}</p>}
                      {h.horario && <p className="mt-1 text-efa-ash">{h.horario}</p>}
                      {h.descripcion && <p className="mt-1 text-sm text-efa-ash">{h.descripcion}</p>}
                      {h.maps_url && (
                        <a
                          href={h.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-efa-red hover:underline"
                        >
                          📍 Cómo llegar
                        </a>
                      )}
                    </div>
                    {mapa && (
                      <div className="relative min-h-[180px] border-t border-efa-ash/30 sm:border-l sm:border-t-0">
                        <iframe
                          src={mapa}
                          title={`Mapa de ${h.lugar ?? h.dia}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* VISTA PREVIA GALERÍA */}
      {galeria.length > 0 && (
        <Section tone="light">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl text-efa-ink sm:text-4xl">Galería</h2>
              <Link
                href="/galeria"
                className="border-b-2 border-efa-ink/30 pb-1 font-semibold text-efa-ink transition hover:border-efa-red"
              >
                Ver todo
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {galeria.map((it) => {
                const yt = it.enlace_youtube ? youtubeId(it.enlace_youtube) : null;
                const thumb = it.tipo === "foto" ? it.url : yt ? youtubeThumb(yt) : null;
                return (
                  <Link
                    key={it.id}
                    href="/galeria"
                    className="relative aspect-square overflow-hidden rounded-lg bg-efa-ink/80"
                  >
                    {thumb && (
                      <img src={thumb} alt={it.titulo ?? ""} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </Link>
                );
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA FINAL: SÚMATE + RÉTANOS */}
      <section className="bg-efa-red">
        <Container className="py-16">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-3xl text-white sm:text-4xl">¿Tienes ganas de jugar?</h2>
              <p className="mt-3 max-w-sm text-white/85">Súmate al club. Abierto a todas las edades y niveles.</p>
              <Link
                href="/registro"
                className="mt-6 inline-flex items-center rounded-sm bg-efa-ink px-7 py-3 font-semibold text-efa-bone transition hover:bg-black"
              >
                Súmate al club
              </Link>
            </div>
            <div className="border-t border-white/30 pt-10 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0">
              <h2 className="text-3xl text-white sm:text-4xl">¿Tienes equipo?</h2>
              <p className="mt-3 max-w-sm text-white/85">Rétanos a un partido y cuadramos el encuentro.</p>
              <Link
                href="/retar"
                className="mt-6 inline-flex items-center rounded-sm border-2 border-white px-7 py-3 font-semibold text-white transition hover:bg-white hover:text-efa-red"
              >
                Rétanos a jugar
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
