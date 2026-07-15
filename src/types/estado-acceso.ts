import { EstadoSuscripcion } from "@prisma/client";

export type EstadoAcceso = {
  tieneAcceso: boolean;

  estado: EstadoSuscripcion | "SIN_SUSCRIPCION";

  diasRestantes: number | null;

  mensaje: string | null;
};