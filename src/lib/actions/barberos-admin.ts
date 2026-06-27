"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const esquemaBarbero = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  colorAgenda: z.string().default("#3b82f6"),
});

export async function crearBarbero(input: z.infer<typeof esquemaBarbero>) {
  const datos = esquemaBarbero.parse(input);

  const existente = await prisma.usuario.findUnique({
    where: { email: datos.email },
  });

  if (existente) {
    throw new Error("Ya existe un usuario registrado con ese email.");
  }

  // Password temporal: el barbero la cambia en su primer ingreso (a implementar despues)
  const passwordTemporal = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      passwordHash,
    },
  });

  const miembro = await prisma.miembroBarberia.create({
    data: {
      barberiaId: datos.barberiaId,
      usuarioId: usuario.id,
      rol: "BARBERO",
      colorAgenda: datos.colorAgenda,
    },
  });

  // Horario de atencion default: lunes a sabado, 9 a 19hs.
  // El dueño lo puede ajustar despues desde el panel.
  for (let dia = 0; dia <= 6; dia++) {
    await prisma.horarioAtencion.create({
      data: {
        barberoId: miembro.id,
        diaSemana: dia,
        horaInicio: "09:00",
        horaFin: "19:00",
      },
    });
  }

  return { miembro, passwordTemporal };
}

const esquemaEdicionBarbero = z.object({
  miembroId: z.string(),
  nombre: z.string().min(2),
  telefono: z.string().optional(),
  colorAgenda: z.string(),
});

export async function editarBarbero(input: z.infer<typeof esquemaEdicionBarbero>) {
  const datos = esquemaEdicionBarbero.parse(input);

  const miembro = await prisma.miembroBarberia.findUnique({
    where: { id: datos.miembroId },
  });
  if (!miembro) throw new Error("Barbero no encontrado.");

  await prisma.usuario.update({
    where: { id: miembro.usuarioId },
    data: { nombre: datos.nombre, telefono: datos.telefono },
  });

  return prisma.miembroBarberia.update({
    where: { id: datos.miembroId },
    data: { colorAgenda: datos.colorAgenda },
  });
}

export async function actualizarEstadoBarbero(miembroId: string, activo: boolean) {
  return prisma.miembroBarberia.update({
    where: { id: miembroId },
    data: { activo },
  });
}
