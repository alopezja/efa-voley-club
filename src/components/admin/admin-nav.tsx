import Link from "next/link";

const upcoming = ["Noticias", "Convocatorias", "Galería", "Jugadores", "Mensajes"];

export function AdminNav({ email }: { email?: string | null }) {
  return (
    <nav
      aria-label="Panel de administración"
      className="flex w-full flex-col gap-2 border-b border-efa-ash/30 bg-efa-ink p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6"
    >
      <p className="mb-2 font-display text-xl uppercase text-efa-bone">Panel EFA</p>
      <Link
        href="/admin"
        className="block rounded-md bg-efa-red px-4 py-3 text-base font-semibold text-efa-chalk"
      >
        Dashboard
      </Link>
      {upcoming.map((label) => (
        <span
          key={label}
          aria-disabled="true"
          className="flex items-center justify-between rounded-md px-4 py-3 text-base text-efa-ash"
        >
          {label}
          <span className="text-xs uppercase tracking-wide">próximamente</span>
        </span>
      ))}
      <div className="mt-4 border-t border-efa-ash/30 pt-4 md:mt-auto">
        {email && <p className="mb-3 truncate text-sm text-efa-ash">{email}</p>}
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-md border border-efa-ash/50 px-4 py-3 text-base font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
