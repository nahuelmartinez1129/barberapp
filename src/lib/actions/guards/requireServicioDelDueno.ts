import { prisma } from "@/lib/prisma";

type Input = {
  usuarioId: string;
  servicioId: string;
};

export async function requireServicioDelDueno({
  usuarioId,
  servicioId,
}: Input) {
  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },

    include: {
      barberia: {
        include: {
          miembros: {
            where: {
              usuarioId,
              activo: true,
              rol: "DUENO",
            },
          },

          suscripcion: true,
        },
      },
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  if (servicio.barberia.miembros.length === 0) {
    throw new Error(
      "No tenés permisos sobre este servicio."
    );
  }

  return servicio;
}