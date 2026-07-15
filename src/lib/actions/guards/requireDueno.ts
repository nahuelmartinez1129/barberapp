import { prisma } from "@/lib/prisma";
import { RolBarberia } from "@prisma/client";

type Input = {
  usuarioId: string;
  slug: string;
};

export async function requireDueno({
  usuarioId,
  slug,
}: Input) {
  const barberia = await prisma.barberia.findUnique({
    where: {
      slug,
    },
    include: {
      suscripcion: true,
    },
  });

  if (!barberia) {
    throw new Error("La barbería no existe.");
  }

  const miembro =
    await prisma.miembroBarberia.findFirst({
      where: {
        usuarioId,
        barberiaId: barberia.id,
        activo: true,
        rol: RolBarberia.DUENO,
      },
    });

  if (!miembro) {
    throw new Error(
      "No tenés permisos para acceder a esta barbería."
    );
  }

  return {
    barberia,
    miembro,
  };
}