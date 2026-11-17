export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-efa-cream/60">
        <p className="font-display text-efa-cream">ESO FUE ADENTRO · VOLEY CLUB</p>
        <p className="mt-2">© {new Date().getFullYear()} EFA Voley Club. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
