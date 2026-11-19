import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo EFA Voley Club recolecta, usa y protege los datos de sus jugadores.",
};

export default function PrivacidadPage() {
  return (
    <Section tone="light">
      <Container>
        <div className="mx-auto max-w-2xl text-efa-ink">
          <h1 className="text-4xl text-efa-ink sm:text-5xl">Política de Privacidad</h1>
          <p className="mt-3 text-sm text-efa-ink/60">Última actualización: 19 de noviembre de 2026</p>

          <div className="mt-8 space-y-6 text-efa-ink/80">
            <p>
              En <strong>Eso Fue Adentro Voley Club (EFA Voley Club)</strong> cuidamos los datos de
              nuestros jugadores. Esta política explica qué información recogemos, para qué la usamos
              y cómo la protegemos.
            </p>

            <section>
              <h2 className="text-2xl text-efa-ink">Qué datos recogemos</h2>
              <p className="mt-2">
                Cuando te registras o completas tu perfil: nombre y apellido, correo, teléfono, fecha
                de nacimiento, posición, nivel de experiencia, disponibilidad, preferencias de
                camiseta, foto, y —para tu seguridad en cancha— EPS/seguro y un contacto de
                emergencia. Si inicias sesión con Google, recibimos tu correo y nombre básicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Para qué los usamos</h2>
              <p className="mt-2">
                Para gestionar tu participación en el club: armar equipos, asignarte número,
                convocarte a juegos y torneos, comunicarnos contigo (correo y notificaciones del
                portal) y organizar la logística (por ejemplo, el pedido de camisetas). Los datos de
                salud y emergencia se usan únicamente ante una eventualidad durante la actividad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Con quién se comparten</h2>
              <p className="mt-2">
                Tus datos los ven solo los administradores del club. <strong>No vendemos</strong> ni
                compartimos tu información con terceros con fines comerciales. Nos apoyamos en
                proveedores que procesan los datos solo para prestarnos el servicio: Supabase (base
                de datos e inicio de sesión), Cloudflare R2 (almacenamiento de fotos), Resend (envío
                de correos) y Google (inicio de sesión con Google).
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Notificaciones</h2>
              <p className="mt-2">
                Si activas las notificaciones, guardamos un identificador de tu navegador para
                enviarte avisos del club. Puedes desactivarlas cuando quieras desde tu portal o desde
                los ajustes de tu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Tus derechos</h2>
              <p className="mt-2">
                Puedes pedir acceder, corregir o eliminar tus datos escribiéndonos a{" "}
                <a href="mailto:efavoleyclub@gmail.com" className="font-semibold text-efa-red underline">
                  efavoleyclub@gmail.com
                </a>
                . Conservamos tu información mientras seas parte del club.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Menores de edad</h2>
              <p className="mt-2">
                Si eres menor de edad, pedimos que un padre, madre o acudiente autorice tu registro
                y el tratamiento de tus datos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-efa-ink">Contacto</h2>
              <p className="mt-2">
                Para cualquier duda sobre esta política, escríbenos a{" "}
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
