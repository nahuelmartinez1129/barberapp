"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  EstadoSuscripcion,
  PlanSuscripcion,
  RolBarberia,
} from "@prisma/client";

import type { RegistroBarberiaData } from "@/types/registro";


const esquemaRegistro = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),

  email: z
  .string()
  .trim()
  .toLowerCase()
  .email(),

  password: z.string().min(6),

  barberia: z.string().min(2),

 slug: z
  .string()
  .min(2)
  .max(40)
  .regex(
    /^[a-z0-9-]+$/,
    "El slug solo puede contener letras minúsculas, números y guiones."
  ),

  telefono: z.string().optional(),

  direccion: z.string().optional(),
});

export async function registrarBarberia(
  input: RegistroBarberiaData
) {
  const datos = esquemaRegistro.parse(input);

  const email = datos.email.toLowerCase().trim();

  const slug = datos.slug
  .trim()
  .toLowerCase();

  const existeUsuario = await prisma.usuario.findUnique({
    where: {
      email,
    },
  });

  if (existeUsuario) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }

  const existeBarberia = await prisma.barberia.findUnique({
    where: {
      slug,
    },
  });

  if (existeBarberia) {
    throw new Error("Ese nombre ya está siendo utilizado.");
  }

  const passwordHash = await bcrypt.hash(datos.password, 10);

  const resultado = await prisma.$transaction(async (tx) => {
    // ==========================
    // Usuario dueño
    // ==========================

    const usuario = await tx.usuario.create({
      data: {
        nombre: `${datos.nombre} ${datos.apellido}`,
        email,
        telefono: datos.telefono,
        passwordHash,
      },
    });

    // ==========================
    // Barbería
    // ==========================

    const barberia = await tx.barberia.create({
      data: {
        nombre: datos.barberia,
        slug,
        telefono: datos.telefono,
        direccion: datos.direccion,
      },
    });

    // ==========================
    // Dueño
    // ==========================

    await tx.miembroBarberia.create({
      data: {
        usuarioId: usuario.id,
        barberiaId: barberia.id,
        rol: RolBarberia.DUENO,
      },
    });

    // ==========================
    // Suscripción
    // ==========================

    const hoy = new Date();

    const proximoPago = new Date();

    proximoPago.setDate(proximoPago.getDate() + 30);

    await tx.suscripcion.create({
      data: {
        barberiaId: barberia.id,

        estado: EstadoSuscripcion.PRUEBA,

        plan: PlanSuscripcion.BASICO,

        precioMensual: 100,

        fechaInicio: hoy,

        fechaProximoPago: proximoPago,
      },
    });

    // ==========================
    // Horarios
    // ==========================

    const horarios: {
  barberiaId: string;
  diaSemana: number;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}[] = [];

    for (let dia = 0; dia <= 6; dia++) {
      horarios.push({
        barberiaId: barberia.id,

        diaSemana: dia,

        activo: dia !== 0,

        horaInicio: "09:00",

        horaFin: "19:00",
      });
    }

    await tx.horarioBarberia.createMany({
      data: horarios,
    });

    return {
      usuario,
      barberia,
    };
  });

  return {
    ok: true,
    slug: resultado.barberia.slug,
  };
}