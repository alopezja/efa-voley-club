import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Galería",
  description: "Galería de EFA Voley Club: fotos y videos del equipo. Próximamente.",
};

export default function Page() {
  return <ComingSoon titulo="Galería" descripcion="Fotos y videos de entrenamientos, partidos y momentos del equipo." />;
}
