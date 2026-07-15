"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";
import { requireSuscripcionBarbero } from "@/lib/actions/guards/requireSuscripcionBarbero";


const esquemaBarbero = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  colorAgenda: z.string().default("#3b82f6"),
});

export async function crearBarbero(
  input: z.infer<typeof esquemaBarbero>
) {
  const datos = esquemaBarbero.parse(input);

  await requireSuscripcionActiva(
    datos.barberiaId
  );

  const existente = await prisma.usuario.findUnique({
    where: {
      email: datos.email,
    },
  });

  if (existente) {
    throw new Error(
      "Ya existe un usuario registrado con ese email."
    );
  }

  // Password temporal: el barbero la cambia en su primer ingreso.
  const passwordTemporal = Math.random()
    .toString(36)
    .slice(-8);

  const passwordHash = await bcrypt.hash(
    passwordTemporal,
    10
  );

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        passwordHash,
      },
    });

    const miembro = await tx.miembroBarberia.create({
      data: {
        barberiaId: datos.barberiaId,
        usuarioId: usuario.id,
        rol: "BARBERO",
        colorAgenda: datos.colorAgenda,
      },
    });

    // Horario por defecto
    for (let dia = 0; dia <= 6; dia++) {
      await tx.horarioAtencion.create({
        data: {
          barberoId: miembro.id,
          diaSemana: dia,
          horaInicio: "09:00",
          horaFin: "19:00",
        },
      });
    }

    return {
      miembro,
      passwordTemporal,
    };
  });
}

const esquemaEdicionBarbero = z.object({
  miembroId: z.string(),
  nombre: z.string().min(2),
  telefono: z.string().optional(),
  colorAgenda: z.string(),
});

export async function editarBarbero(
  input: z.infer<typeof esquemaEdicionBarbero>
) {
  const datos = esquemaEdicionBarbero.parse(input);

  await requireSuscripcionBarbero(
    datos.miembroId
  );

  const miembro = await prisma.miembroBarberia.findUnique({
    where: {
      id: datos.miembroId,
    },
    select: {
      usuarioId: true,
    },
  });

  if (!miembro) {
    throw new Error("Barbero no encontrado.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: {
        id: miembro.usuarioId,
      },
      data: {
        nombre: datos.nombre,
        telefono: datos.telefono,
      },
    });

    return tx.miembroBarberia.update({
      where: {
        id: datos.miembroId,
      },
      data: {
        colorAgenda: datos.colorAgenda,
      },
    });
  });
}
export async function actualizarEstadoBarbero(
  miembroId: string,
  activo: boolean
) {

  await requireSuscripcionBarbero(
    miembroId
  );

  return prisma.miembroBarberia.update({
    where: {
      id: miembroId,
    },
    data: {
      activo,
    },
  });
}
