import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { RegistroForm } from "@/components/registro-form";

export const metadata: Metadata = {
  title: "Súmate al club",
  description:
    "Regístrate en Eso Fue Adentro Voley Club. Abierto a todas las edades, por el gusto de jugar. Déjanos tus datos y te contactamos.",
};

export default function RegistroPage() {
  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl">
          <div className="border-l-2 border-efa-red pl-6">
            <h1 className="text-4xl text-efa-ink sm:text-6xl">Súmate al club</h1>
            <p className="mt-5 text-lg text-efa-ink/70">
              Déjanos tus datos y te contactamos para darte la bienvenida. No importa tu nivel ni tu
              edad: aquí hay cancha para ti.
            </p>
          </div>
          <div className="mt-10">
            <RegistroForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
