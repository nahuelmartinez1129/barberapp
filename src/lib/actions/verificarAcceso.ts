import { prisma } from "@/lib/prisma";
import { EstadoSuscripcion } from "@prisma/client";
import {
  Barberia,
  Suscripcion,
} from "@prisma/client";

import {
  puedeUsarSistema,
  obtenerMensajeEstado,
} from "@/lib/suscripcion";

export type ResultadoAcceso =
  | {
      permitida: true;
      barberia: Barberia;
      suscripcion: Suscripcion;
      mensaje: string | null;
    }
  | {
      permitida: false;
      motivo:
        | "BARBERIA_NO_EXISTE"
        | "SIN_SUSCRIPCION"
        | "SUSCRIPCION_BLOQUEADA";

      barberia: Barberia | null;
      suscripcion: Suscripcion | null;
      mensaje: string | null;
    };

export async function verificarAcceso(
  barberiaId: string
): Promise<ResultadoAcceso> {

  const barberia =
    await prisma.barberia.findUnique({
      where: {
        id: barberiaId,
      },
      include: {
        suscripcion: true,
      },
    });

  if (!barberia) {
    return {
      permitida: false,
      motivo: "BARBERIA_NO_EXISTE",
      barberia: null,
      suscripcion: null,
      mensaje: "La barbería no existe.",
    };
  }

  if (!barberia.suscripcion) {
    return {
      permitida: false,
      motivo: "SIN_SUSCRIPCION",
      barberia,
      suscripcion: null,
      mensaje:
        "La barbería no tiene una suscripción.",
    };
  }

  // Si la prueba venció y todavía figura como PRUEBA,
// la marcamos automáticamente como VENCIDA.
if (
  barberia.suscripcion.estado === EstadoSuscripcion.PRUEBA &&
  barberia.suscripcion.fechaProximoPago < new Date()
) {
  barberia.suscripcion = await prisma.suscripcion.update({
    where: {
      id: barberia.suscripcion.id,
    },
    data: {
      estado: EstadoSuscripcion.VENCIDA,
    },
  });
}
  if (
    !puedeUsarSistema(
      barberia.suscripcion.estado
    )
  ) {
    return {
      permitida: false,
      motivo: "SUSCRIPCION_BLOQUEADA",
      barberia,
      suscripcion: barberia.suscripcion,
      mensaje: obtenerMensajeEstado(
        barberia.suscripcion.estado
      ),
    };
  }

  return {
    permitida: true,
    barberia,
    suscripcion: barberia.suscripcion,
    mensaje: obtenerMensajeEstado(
      barberia.suscripcion.estado
    ),
  };
}