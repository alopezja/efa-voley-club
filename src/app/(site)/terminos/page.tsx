import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Condiciones del Servicio",
  description: "Condiciones de uso del portal de EFA Voley Club.",
};

export default function TerminosPage() {
  return (
    <Section tone="light">
      <Container>
        <div className="mx-auto max-w-2xl text-efa-ink">
          <h1 className="text-4xl text-efa-ink sm:text-5xl">Condiciones del Servicio</h1>
          <p className="mt-3 text-sm text-efa-ink/60">Última actualización: 19 de noviembre de 2026</p>

          <div className="mt-8 space-y-6 text-efa-ink/80">
            <p>
              Bienvenido al portal de <strong>Eso Fue Adentro Voley Club (EFA Voley Club)</strong>, un
              club de voleibol de la comunidad. Al registrarte y usar el portal, aceptas estas
              condiciones.
            </p>

            <section>
              <h2 className="text-2xl text-efa-ink">Qué es</h2>
              <p className="mt-2">
                Es una herramienta gratuita del club para que los jugadores se registren, completen
                su perfil, confirmen asistencia a los juegos y reciban convocatorias y avisos. La
                administración la usa para organizar equipos y la actividad del club.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Tu cuenta</h2>
              <p className="mt-2">
                El acceso es personal. Proporciona información veraz y mantenla actualizada. Eres
                responsable del uso de tu cuenta y del contenido (como tu foto) que subas, que debe
                ser tuyo y apropiado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Convivencia</h2>
              <p className="mt-2">
                Esperamos respeto entre todos los miembros de la comunidad. El club puede suspender el
                acceso ante un uso indebido del portal o conductas que afecten al grupo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Disponibilidad</h2>
              <p className="mt-2">
                El servicio se ofrece &quot;tal cual&quot;, y puede cambiar o interrumpirse por
                mantenimiento o mejoras. Hacemos lo posible por mantenerlo disponible, pero no
                garantizamos que esté libre de fallos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Datos personales</h2>
              <p className="mt-2">
                El tratamiento de tus datos se rige por nuestra{" "}
                <a href="/privacidad" className="font-semibold text-efa-red underline">
                  Política de Privacidad
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Contacto</h2>
              <p className="mt-2">
                Dudas o solicitudes:{" "}
                <a href="mailto:efavoleyclub@gmail.com" className="font-semibold text-efa-red underline">
                  efavoleyclub@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
