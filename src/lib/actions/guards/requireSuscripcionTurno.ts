import { prisma } from "@/lib/prisma";
import { requireSuscripcionActiva } from "./requireSuscripcionActiva";

export async function requireSuscripcionTurno(
  turnoId: string
) {
  const turno = await prisma.turno.findUnique({
    where: {
      id: turnoId,
    },
    select: {
      barberiaId: true,
    },
  });

  if (!turno) {
    throw new Error("Turno no encontrado.");
  }

  return requireSuscripcionActiva(
    turno.barberiaId
  );
}