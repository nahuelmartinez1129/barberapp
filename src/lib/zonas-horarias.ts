export const ZONAS_HORARIAS_SOPORTADAS = [
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Montevideo",
  "America/Asuncion",
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
] as const;

export type ZonaHoraria =
  (typeof ZONAS_HORARIAS_SOPORTADAS)[number];

export function esZonaHorariaValida(
  zona: string
): zona is ZonaHoraria {
  return (
    ZONAS_HORARIAS_SOPORTADAS as readonly string[]
  ).includes(zona);
}