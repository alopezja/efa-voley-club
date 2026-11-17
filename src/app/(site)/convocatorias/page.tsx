import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Convocatorias",
  description: "Convocatorias de EFA Voley Club: torneos, pruebas y encuentros. Próximamente.",
};

export default function Page() {
  return <ComingSoon titulo="Convocatorias" descripcion="Torneos, pruebas y encuentros abiertos para sumarte a la cancha." />;
}
