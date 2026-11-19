// Tipos y constantes puros de equipos (sin dependencias de servidor), para que
// los puedan importar tanto componentes cliente como código de servidor.

export type TeamTipo = "entrenamiento" | "oficial";

export type Team = {
  id: string;
  nombre: string;
  tipo: TeamTipo;
  created_at: string;
  miembros: number;
};

export type Membership = {
  id: string;
  team_id: string;
  player_id: string;
  numero: number | null;
  team?: { nombre: string; tipo: TeamTipo };
};

export const TIPO_LABEL: Record<TeamTipo, string> = {
  entrenamiento: "Entrenamiento",
  oficial: "Oficial (torneos)",
};
