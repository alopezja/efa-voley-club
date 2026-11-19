"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/container";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-efa-chalk/10 bg-efa-ink/90 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/efa-logo.jpg"
            alt="EFA Voley Club"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="font-display text-xl text-efa-bone">
            EFA <span className="text-efa-red">VOLEY</span> CLUB
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`text-sm transition-colors hover:text-efa-red ${
                isActive(i.href) ? "text-efa-red" : "text-efa-bone/80"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/acceso"
            className="hidden rounded-sm border border-efa-bone/30 px-4 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red sm:inline-flex"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="hidden rounded-sm bg-efa-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-efa-red/90 sm:inline-flex"
          >
            Súmate
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex h-10 w-10 items-center justify-center text-efa-bone md:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current transition ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition ${
                  open ? "top-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {open && (
        <nav className="border-t border-efa-chalk/10 md:hidden">
          <Container className="flex flex-col py-2">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className={`border-b border-efa-chalk/5 py-3 text-sm ${
                  isActive(i.href) ? "text-efa-red" : "text-efa-bone/80"
                }`}
              >
                {i.label}
              </Link>
            ))}
            <Link
              href="/acceso"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex justify-center rounded-sm border border-efa-bone/30 px-4 py-3 text-sm font-semibold text-efa-bone"
            >
              Ingresar (jugadores)
            </Link>
            <Link
              href="/registro"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-sm bg-efa-red px-4 py-3 text-sm font-semibold text-white"
            >
              Súmate al club
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
