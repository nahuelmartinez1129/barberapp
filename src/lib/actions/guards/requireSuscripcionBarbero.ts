import { prisma } from "@/lib/prisma";

import { requireSuscripcionActiva } from "./requireSuscripcionActiva";

export async function requireSuscripcionBarbero(
  barberoId: string
) {
  const barbero = await prisma.miembroBarberia.findUnique({
    where: {
      id: barberoId,
    },

    select: {
      barberiaId: true,
    },
  });

  if (!barbero) {
    throw new Error("Barbero no encontrado.");
  }

  return requireSuscripcionActiva(
    barbero.barberiaId
  );
}