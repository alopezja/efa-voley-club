import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ChallengeForm } from "@/components/challenge-form";
import { whatsappLink } from "@/lib/club";

export const metadata: Metadata = {
  title: "Rétanos a jugar",
  description:
    "¿Tienes equipo y quieres jugar contra Eso Fue Adentro Voley Club? Rétanos a un partido y cuadramos el encuentro.",
};

export default function RetarPage() {
  const whatsappUrl = whatsappLink("¡Hola! Queremos retar a Eso Fue Adentro Voley Club a un partido. 🏐");

  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl">
          <div className="border-l-2 border-efa-red pl-6">
            <h1 className="text-4xl text-efa-ink sm:text-6xl">Rétanos a jugar</h1>
            <p className="mt-5 text-lg text-efa-ink/70">
              ¿Tienes equipo o un grupo de amigos y quieres medirte con nosotros? Déjanos tus datos
              y una propuesta de día; cuadramos el partido.
            </p>
          </div>
          <div className="mt-10">
            <ChallengeForm whatsappUrl={whatsappUrl} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
