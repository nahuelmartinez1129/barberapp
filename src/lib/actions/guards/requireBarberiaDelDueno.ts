import { prisma } from "@/lib/prisma";

type Input = {
  usuarioId: string;
  barberiaId: string;
};

export async function requireBarberiaDelDueno({
  usuarioId,
  barberiaId,
}: Input) {
  const barberia = await prisma.barberia.findUnique({
    where: {
      id: barberiaId,
    },

    include: {
      miembros: {
        where: {
          usuarioId,
          rol: "DUENO",
          activo: true,
        },
      },

      suscripcion: true,
    },
  });

  if (!barberia) {
    throw new Error("La barbería no existe.");
  }

  if (barberia.miembros.length === 0) {
    throw new Error(
      "No tenés permisos sobre esta barbería."
    );
  }

  return barberia;
}