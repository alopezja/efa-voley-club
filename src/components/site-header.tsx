import Link from "next/link";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-efa-black/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold text-efa-cream">
          EFA <span className="text-efa-red">Voley</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className="text-sm text-efa-cream/80 hover:text-efa-red transition-colors">
              {i.label}
            </Link>
          ))}
        </nav>
        <Link href="/registro" className="rounded bg-efa-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Súmate
        </Link>
      </div>
    </header>
  );
}
