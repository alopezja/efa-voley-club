import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

type Props = { titulo: string; descripcion: string };

export function ComingSoon({ titulo, descripcion }: Props) {
  return (
    <Section tone="dark">
      <Container className="py-12 sm:py-20">
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-5xl text-efa-bone sm:text-7xl">{titulo}</h1>
          <p className="mt-6 text-lg leading-relaxed text-efa-ash">{descripcion}</p>
          <p className="mt-4 font-semibold text-efa-red">Estamos preparando esta sección. Muy pronto.</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center border-b-2 border-efa-chalk/40 pb-1 font-semibold text-efa-bone transition hover:border-efa-red"
          >
            Volver al inicio
          </Link>
        </div>
      </Container>
    </Section>
  );
}
