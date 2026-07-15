import { prisma } from "@/lib/prisma";

import { requireSuscripcionActiva } from "./requireSuscripcionActiva";

export async function requireSuscripcionServicio(
  servicioId: string
) {
  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },
    select: {
      barberiaId: true,
    },
  });

  if (!servicio) {
    throw new Error("Servicio no encontrado.");
  }

  return requireSuscripcionActiva(
    servicio.barberiaId
  );
}