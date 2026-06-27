/**
 * Constantes y tipos compartidos para horarios semanales (0 = domingo,
 * 6 = sabado), reutilizados tanto por el horario general de la BARBERIA
 * (HorarioBarberia) como por el horario individual de cada BARBERO
 * (HorarioAtencion). Mantenerlos en un solo lugar evita que ambos
 * formularios terminen con constantes ligeramente distintas.
 */

export const NOMBRES_DIA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

// Orden de visualizacion: Lunes a Domingo (no Domingo a Sabado)
export const ORDEN_VISUAL_DIAS = [1, 2, 3, 4, 5, 6, 0];

export type DiaHorario = {
  diaSemana: number;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
};
