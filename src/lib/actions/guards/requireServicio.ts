import { prisma } from "@/lib/prisma";

export async function requireServicio(
  servicioId: string
) {
  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },
    include: {
      barberia: {
        include: {
          suscripcion: true,
        },
      },
      barberosAsignados: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  return servicio;
}