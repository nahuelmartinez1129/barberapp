import type { ResultadoAcceso } from "@/lib/actions/verificarAcceso";
import type { EstadoAcceso } from "@/types/estado-acceso";

export function crearEstadoAcceso(
  acceso: ResultadoAcceso
): EstadoAcceso {
  return {
    tieneAcceso: acceso.permitida,

    estado:
      acceso.suscripcion?.estado ??
      "SIN_SUSCRIPCION",

    diasRestantes: acceso.suscripcion
      ? Math.max(
          0,
          Math.ceil(
            (acceso.suscripcion.fechaProximoPago.getTime() -
              Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null,

    mensaje: acceso.mensaje,
  };
}