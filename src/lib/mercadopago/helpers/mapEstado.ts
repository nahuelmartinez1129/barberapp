import { EstadoSuscripcion } from "@prisma/client";

export function mapEstadoMercadoPago(
  estado: string
): EstadoSuscripcion {
  switch (estado) {
    case "authorized":
  return EstadoSuscripcion.ACTIVA;

case "paused":
  return EstadoSuscripcion.CANCELADA;

case "cancelled":
  return EstadoSuscripcion.CANCELADA;

case "pending":
  return EstadoSuscripcion.PRUEBA;

case "processed":
  return EstadoSuscripcion.ACTIVA;

default:
  return EstadoSuscripcion.VENCIDA;
  }
}