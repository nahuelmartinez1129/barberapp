"use server";

import { prisma } from "@/lib/prisma";
import { EstadoSuscripcion } from "@prisma/client";

async function actualizarEstado(
  barberiaId: string,
  estado: EstadoSuscripcion
) {
  return prisma.suscripcion.update({
    where: {
      barberiaId,
    },
    data: {
      estado,
    },
  });
}

export async function activarSuscripcion(
  barberiaId: string
) {
  return actualizarEstado(
    barberiaId,
    EstadoSuscripcion.ACTIVA
  );
}

export async function cancelarSuscripcion(
  barberiaId: string
) {
  return actualizarEstado(
    barberiaId,
    EstadoSuscripcion.CANCELADA
  );
}

export async function reactivarSuscripcion(
  barberiaId: string
) {
  return actualizarEstado(
    barberiaId,
    EstadoSuscripcion.ACTIVA
  );
}

export async function marcarSuscripcionVencida(
  barberiaId: string
) {
  return actualizarEstado(
    barberiaId,
    EstadoSuscripcion.VENCIDA
  );
}