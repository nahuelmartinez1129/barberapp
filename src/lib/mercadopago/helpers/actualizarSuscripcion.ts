import {
  EstadoSuscripcion,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Input = {
  mercadopagoSubId: string;

  estado: EstadoSuscripcion;

  respuesta: Prisma.InputJsonValue;

  fechaProximoPago: Date | null;
};

export async function actualizarSuscripcionMP({
  mercadopagoSubId,
  estado,
  respuesta,
  fechaProximoPago,
}: Input) {
  return prisma.suscripcion.update({
    where: {
      mercadopagoSubId,
    },

    data: {
      estado,

      fechaProximoPago:
        fechaProximoPago || undefined,

      fechaUltimaSincronizacion:
        new Date(),

      ultimaRespuestaMP:
        respuesta,
    },
  });
}