// Motor de logros (gamificación). Puro: recibe un resumen del jugador y
// devuelve la lista de logros con cuáles ya consiguió. Extensible: agregar
// un logro es añadir una entrada aquí.

export type Logro = {
  key: string;
  titulo: string;
  descripcion: string;
  icono: string;
  conseguido: boolean;
};

export type ResumenJugador = {
  perfilCompleto: boolean;
  totalVoy: number; // veces que confirmó asistencia
};

export function calcularLogros(r: ResumenJugador): Logro[] {
  return [
    {
      key: "bienvenido",
      titulo: "Parte del club",
      descripcion: "Te uniste a EFA Voley Club.",
      icono: "🏐",
      conseguido: true,
    },
    {
      key: "perfil_completo",
      titulo: "Perfil al 100%",
      descripcion: "Completaste todo tu perfil.",
      icono: "✅",
      conseguido: r.perfilCompleto,
    },
    {
      key: "primer_juego",
      titulo: "Primer llamado",
      descripcion: "Confirmaste tu asistencia a un juego.",
      icono: "📣",
      conseguido: r.totalVoy >= 1,
    },
    {
      key: "cinco_juegos",
      titulo: "Habitual",
      descripcion: "Confirmaste 5 juegos.",
      icono: "🔥",
      conseguido: r.totalVoy >= 5,
    },
    {
      key: "diez_juegos",
      titulo: "Pilar del equipo",
      descripcion: "Confirmaste 10 juegos.",
      icono: "⭐",
      conseguido: r.totalVoy >= 10,
    },
  ];
}

export function contarConseguidos(logros: Logro[]): number {
  return logros.filter((l) => l.conseguido).length;
}
