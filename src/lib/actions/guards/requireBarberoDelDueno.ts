import { prisma } from "@/lib/prisma";

type Input = {
  usuarioId: string;
  miembroId: string;
};

export async function requireBarberoDelDueno({
  usuarioId,
  miembroId,
}: Input) {
  const miembro =
    await prisma.miembroBarberia.findUnique({
      where: {
        id: miembroId,
      },

      include: {
        barberia: {
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
        },

        usuario: true,
      },
    });

  if (!miembro) {
    throw new Error(
      "El barbero no existe."
    );
  }

  if (
    miembro.barberia.miembros.length === 0
  ) {
    throw new Error(
      "No tenés permisos sobre este barbero."
    );
  }

  return miembro;
}