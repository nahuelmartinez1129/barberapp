import { prisma } from "@/lib/prisma";
import { RolBarberia } from "@prisma/client";

type Input = {
  usuarioId: string;
  barberiaId: string;
  roles?: RolBarberia[];
};

export async function requireMiembroBarberia({
  usuarioId,
  barberiaId,
  roles,
}: Input) {
  const miembro =
    await prisma.miembroBarberia.findFirst({
      where: {
        usuarioId,
        barberiaId,
        activo: true,
      },
    });

  if (!miembro) {
    throw new Error(
      "No pertenecés a esta barbería."
    );
  }

  if (
    roles &&
    !roles.includes(miembro.rol)
  ) {
    throw new Error(
      "No tenés permisos para realizar esta acción."
    );
  }

  return miembro;
}