import { EstadoSuscripcion } from "@prisma/client";

/**
 * Indica si la barbería puede utilizar el sistema.
 */
export function puedeUsarSistema(
  estado: EstadoSuscripcion
): boolean {
  return (
    estado === EstadoSuscripcion.ACTIVA ||
    estado === EstadoSuscripcion.PRUEBA
  );
}

/**
 * Indica si la suscripción está bloqueada.
 */
export function estaBloqueada(
  estado: EstadoSuscripcion
): boolean {
  return (
    estado === EstadoSuscripcion.CANCELADA ||
    estado === EstadoSuscripcion.VENCIDA
  );
}

/**
 * Indica si la barbería necesita regularizar el pago.
 */
export function necesitaPago(
  estado: EstadoSuscripcion
): boolean {
  return estaBloqueada(estado);
}

/**
 * Devuelve un mensaje corto según el estado.
 */
export function obtenerMensajeEstado(
  estado: EstadoSuscripcion
): string | null {
  switch (estado) {
    case EstadoSuscripcion.PRUEBA:
      return "Estás utilizando el período de prueba.";

    case EstadoSuscripcion.ACTIVA:
      return "Tu suscripción está activa.";

    case EstadoSuscripcion.CANCELADA:
      return "La suscripción fue cancelada.";

    case EstadoSuscripcion.VENCIDA:
      return "La suscripción está vencida.";

    default:
      return null;
  }
}