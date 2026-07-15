"use server";
import { requireSession } from "@/lib/auth/requireSession";
import { requireServicioDelDueno } from "@/lib/actions/guards/requireServicioDelDueno";
import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";
import { requireBarberiaDelDueno } from "@/lib/actions/guards/requireBarberiaDelDueno";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const esquemaServicio = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  precio: z.number().positive(),
  duracionMinutos: z.number().int().positive(),
  barberoIds: z.array(z.string()),
});

export async function crearServicio(
  input: z.infer<typeof esquemaServicio>
) {
  const datos = esquemaServicio.parse(input);

  const session = await requireSession();

  const barberia =
    await requireBarberiaDelDueno({
      usuarioId: session.user.id,
      barberiaId: datos.barberiaId,
    });

  await requireSuscripcionActiva(
    barberia.id
  );

  return prisma.$transaction(async (tx) => {
    const servicio = await tx.servicio.create({
      data: {
        barberiaId: datos.barberiaId,
        nombre: datos.nombre,
        precio: datos.precio,
        duracionMinutos: datos.duracionMinutos,
      },
    });

    if (datos.barberoIds.length > 0) {
      await tx.barberoServicio.createMany({
        data: datos.barberoIds.map((barberoId) => ({
          barberoId,
          servicioId: servicio.id,
        })),
      });
    }

    return servicio;
  });
}

const esquemaEdicionServicio = z.object({
  servicioId: z.string(),
  nombre: z.string().min(2),
  precio: z.number().positive(),
  duracionMinutos: z.number().int().positive(),
  barberoIds: z.array(z.string()),
});

export async function editarServicio(
  input: z.infer<typeof esquemaEdicionServicio>
) {
  const datos = esquemaEdicionServicio.parse(input);

  const session = await requireSession();

  const servicio = await requireServicioDelDueno({
    usuarioId: session.user.id,
    servicioId: datos.servicioId,
  });

  await requireSuscripcionActiva(
    servicio.barberia.id
  );

  await prisma.$transaction(async (tx) => {
    await tx.servicio.update({
      where: {
        id: datos.servicioId,
      },
      data: {
        nombre: datos.nombre,
        precio: datos.precio,
        duracionMinutos: datos.duracionMinutos,
      },
    });

    await tx.barberoServicio.deleteMany({
      where: {
        servicioId: datos.servicioId,
      },
    });

    if (datos.barberoIds.length > 0) {
      await tx.barberoServicio.createMany({
        data: datos.barberoIds.map((barberoId) => ({
          barberoId,
          servicioId: datos.servicioId,
        })),
      });
    }
  });
}

  

export async function actualizarEstadoServicio(
  servicioId: string,
  activo: boolean
) {
  const session = await requireSession();

  const servicio = await requireServicioDelDueno({
    usuarioId: session.user.id,
    servicioId,
  });

  await requireSuscripcionActiva(
    servicio.barberia.id
  );

  return prisma.servicio.update({
    where: {
      id: servicioId,
    },
    data: {
      activo,
    },
  });
}

export async function eliminarServicio(
  servicioId: string
) {
  const session = await requireSession();

  const servicio = await requireServicioDelDueno({
    usuarioId: session.user.id,
    servicioId,
  });

  await requireSuscripcionActiva(
    servicio.barberia.id
  );

  const turnosAsociados =
    await prisma.turno.count({
      where: {
        servicioId,
      },
    });

  if (turnosAsociados > 0) {
    throw new Error(
      "No se puede eliminar un servicio con turnos asociados. Pausalo en su lugar."
    );
  }

  return prisma.servicio.delete({
    where: {
      id: servicioId,
    },
  });
}
