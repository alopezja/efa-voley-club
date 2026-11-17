import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Noticias de EFA Voley Club: resultados, crónicas y novedades. Próximamente.",
};

export default function Page() {
  return <ComingSoon titulo="Noticias" descripcion="Resultados, crónicas y novedades del club, todo en un solo lugar." />;
}
