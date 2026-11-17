import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Registro",
  description: "Registro de EFA Voley Club: inscríbete al club. Próximamente.",
};

export default function Page() {
  return <ComingSoon titulo="Registro" descripcion="Muy pronto podrás inscribirte al club desde aquí." />;
}
