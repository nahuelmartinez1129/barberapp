"use server";

import { prisma } from "@/lib/prisma";
import type { EstadoTurno } from "@prisma/client";

import { requireSuscripcionTurno } from "@/lib/actions/guards/requireSuscripcionTurno";

export async function actualizarEstadoTurnoBarbero(
  turnoId: string,
  estado: EstadoTurno
) {
  await requireSuscripcionTurno(turnoId);

  return prisma.turno.update({
    where: {
      id: turnoId,
    },
    data: {
      estado,
    },
  });
}