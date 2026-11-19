import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

const links = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
  { href: "/registro", label: "Súmate" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-efa-chalk/10 bg-efa-ink">
      <Container className="grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/efa-logo.jpg"
              alt="EFA Voley Club"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-lg text-efa-bone">
              EFA <span className="text-efa-red">VOLEY</span> CLUB
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-efa-ash">
            Eso Fue Adentro Voley Club. Un club de la comunidad para jugar vóley
            por gusto, a toda edad.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <span className="font-display text-efa-bone">Navegación</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-efa-ash transition-colors hover:text-efa-red">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-display text-efa-bone">Contacto</span>
          <Link href="/contacto" className="text-efa-ash transition-colors hover:text-efa-red">
            Escríbenos
          </Link>
          <span className="text-efa-ash">Redes sociales: próximamente</span>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-efa-chalk/5 py-6 text-xs text-efa-ash sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} EFA Voley Club. Todos los derechos reservados.</span>
        <span className="flex gap-4">
          <Link href="/privacidad" className="transition-colors hover:text-efa-red">
            Privacidad
          </Link>
          <Link href="/terminos" className="transition-colors hover:text-efa-red">
            Condiciones
          </Link>
        </span>
      </Container>
    </footer>
  );
}
