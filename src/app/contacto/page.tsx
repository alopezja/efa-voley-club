import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbele a Eso Fue Adentro Voley Club: dudas sobre categorías, entrenamientos o convocatorias.",
};

export default function ContactoPage() {
  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-4xl text-efa-ink sm:text-6xl">Contacto</h1>
          <p className="mt-6 text-lg leading-relaxed text-efa-ink/70">
            ¿Dudas sobre categorías, entrenamientos o convocatorias? Cuéntanos.
          </p>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_20rem]">
          <ContactForm />

          <aside className="space-y-8">
            <div className="border-l-2 border-efa-red pl-6">
              <h2 className="text-xl text-efa-ink">Escríbenos</h2>
              <p className="mt-3 text-efa-ink/70">Escríbenos por este formulario.</p>
            </div>
            <div className="border-l-2 border-efa-red pl-6">
              <h2 className="text-xl text-efa-ink">Redes sociales</h2>
              <p className="mt-3 text-efa-ink/70">Próximamente.</p>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
