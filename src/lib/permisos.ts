// Catálogo de secciones del panel que se pueden delegar a un administrador.
// El super_admin siempre las tiene todas. Un admin ve solo las que el
// super_admin le habilite (profiles.permisos). "Equipo" no está aquí:
// la gestión del equipo es exclusiva del super_admin.

export const SECCIONES = [
  { key: "jugadores", label: "Jugadores", href: "/admin/jugadores" },
  { key: "retos", label: "Retos", href: "/admin/retos" },
  { key: "noticias", label: "Noticias", href: "/admin/noticias" },
  { key: "convocatorias", label: "Convocatorias", href: "/admin/convocatorias" },
  { key: "mensajes", label: "Mensajes", href: "/admin/mensajes" },
  { key: "galeria", label: "Galería", href: "/admin/galeria" },
  { key: "horarios", label: "Horarios", href: "/admin/horarios" },
  { key: "equipos", label: "Equipos", href: "/admin/equipos" },
] as const;

export type SeccionKey = (typeof SECCIONES)[number]["key"];

export const SECCION_KEYS: SeccionKey[] = SECCIONES.map((s) => s.key);

export function esSeccionValida(key: string): key is SeccionKey {
  return (SECCION_KEYS as string[]).includes(key);
}
