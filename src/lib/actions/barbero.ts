"use server";

import { prisma } from "@/lib/prisma";
import type { EstadoTurno } from "@prisma/client";

export async function actualizarEstadoTurnoBarbero(
  turnoId: string,
  estado: EstadoTurno
) {
  return prisma.turno.update({
    where: {
      id: turnoId,
    },
    data: {
      estado,
    },
  });
}