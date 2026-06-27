"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export type ClienteBusqueda = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
};

/**
 * Busca clientes YA VINCULADOS a esta barberia (MiembroBarberia rol
 * CLIENTE) por nombre, email o telefono. Se usa desde el modal de
 * "Nuevo turno" para que el dueño pueda elegir un cliente existente sin
 * tener que recordar el email exacto.
 */
export async function buscarClientesBarberia(
  barberiaId: string,
  termino: string
): Promise<ClienteBusqueda[]> {
  const miembros = await prisma.miembroBarberia.findMany({
    where: {
      barberiaId,
      rol: "CLIENTE",
      usuario: {
        OR: [
          { nombre: { contains: termino, mode: "insensitive" } },
          { email: { contains: termino, mode: "insensitive" } },
          { telefono: { contains: termino, mode: "insensitive" } },
        ],
      },
    },
    include: { usuario: true },
    take: 10,
    orderBy: { usuario: { nombre: "asc" } },
  });

  return miembros.map((m) => ({
    id: m.usuario.id,
    nombre: m.usuario.nombre,
    email: m.usuario.email,
    telefono: m.usuario.telefono,
  }));
}

const esquemaClienteNuevo = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  telefono: z.string().min(6),
  email: z.string().email().optional(),
});

/**
 * Crea un cliente nuevo desde el panel admin (turno manual sin reserva
 * online previa). Sigue el mismo patron que crearBarbero: genera un
 * password temporal (el cliente no necesita usarlo de inmediato, ya que
 * el dueño es quien esta creando el turno por el).
 *
 * Si no se provee email, se genera uno interno unico para no romper la
 * restriccion de unicidad de Usuario.email, ya que muchos clientes que
 * el dueño anota a mano no tienen email a mano en el momento.
 */
export async function crearClienteManual(
  input: z.infer<typeof esquemaClienteNuevo>
): Promise<ClienteBusqueda> {
  const datos = esquemaClienteNuevo.parse(input);

  const email =
    datos.email ?? `cliente-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@sin-email.local`;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new Error("Ya existe un usuario registrado con ese email.");
  }

  const passwordTemporal = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email,
      telefono: datos.telefono,
      passwordHash,
    },
  });

  await prisma.miembroBarberia.create({
    data: {
      barberiaId: datos.barberiaId,
      usuarioId: usuario.id,
      rol: "CLIENTE",
    },
  });

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono,
  };
}
