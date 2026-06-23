"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const esquemaServicio = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  precio: z.number().positive(),
  duracionMinutos: z.number().int().positive(),
  barberoIds: z.array(z.string()),
});

export async function crearServicio(input: z.infer<typeof esquemaServicio>) {
  const datos = esquemaServicio.parse(input);

  const servicio = await prisma.servicio.create({
    data: {
      barberiaId: datos.barberiaId,
      nombre: datos.nombre,
      precio: datos.precio,
      duracionMinutos: datos.duracionMinutos,
    },
  });

  if (datos.barberoIds.length > 0) {
    await prisma.barberoServicio.createMany({
      data: datos.barberoIds.map((barberoId) => ({
        barberoId,
        servicioId: servicio.id,
      })),
    });
  }

  return servicio;
}

const esquemaEdicionServicio = z.object({
  servicioId: z.string(),
  nombre: z.string().min(2),
  precio: z.number().positive(),
  duracionMinutos: z.number().int().positive(),
  barberoIds: z.array(z.string()),
});

export async function editarServicio(input: z.infer<typeof esquemaEdicionServicio>) {
  const datos = esquemaEdicionServicio.parse(input);

  await prisma.servicio.update({
    where: { id: datos.servicioId },
    data: {
      nombre: datos.nombre,
      precio: datos.precio,
      duracionMinutos: datos.duracionMinutos,
    },
  });

  // Reemplazamos por completo las asignaciones de barberos para este servicio
  await prisma.barberoServicio.deleteMany({ where: { servicioId: datos.servicioId } });
  if (datos.barberoIds.length > 0) {
    await prisma.barberoServicio.createMany({
      data: datos.barberoIds.map((barberoId) => ({
        barberoId,
        servicioId: datos.servicioId,
      })),
    });
  }
}

export async function actualizarEstadoServicio(servicioId: string, activo: boolean) {
  return prisma.servicio.update({
    where: { id: servicioId },
    data: { activo },
  });
}

export async function eliminarServicio(servicioId: string) {
  const turnosAsociados = await prisma.turno.count({ where: { servicioId } });
  if (turnosAsociados > 0) {
    throw new Error(
      "No se puede eliminar un servicio con turnos asociados. Pausalo en su lugar."
    );
  }
  return prisma.servicio.delete({ where: { id: servicioId } });
}
