"use server";

import { prisma } from "@/lib/prisma";
import { buscarOCrearCliente } from "@/lib/actions/clientes";
import { z } from "zod";

import { requireSession } from "@/lib/auth/requireSession";
import { requireBarberiaDelDueno } from "@/lib/actions/guards/requireBarberiaDelDueno";
import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";

export type ClienteBusqueda = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
};

/**
 * Busca clientes de esta barberia (modelo Cliente, sin autenticacion)
 * por nombre, email o telefono. Se usa desde el modal de "Nuevo turno"
 * para que el dueño pueda elegir un cliente existente.
 */
export async function buscarClientesBarberia(
  barberiaId: string,
  termino: string
): Promise<ClienteBusqueda[]> {

  const session = await requireSession();

  const barberia = await requireBarberiaDelDueno({
    usuarioId: session.user.id,
    barberiaId,
  });

  await requireSuscripcionActiva(
    barberia.id
  );

  const clientes = await prisma.cliente.findMany({
    where: {
      barberiaId,
      OR: [
        {
          nombre: {
            contains: termino,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: termino,
            mode: "insensitive",
          },
        },
        {
          telefono: {
            contains: termino,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 10,
    orderBy: {
      nombre: "asc",
    },
  });

  return clientes.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    email: c.email,
    telefono: c.telefono,
  }));
}

const esquemaClienteNuevo = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  telefono: z.string().min(6),
  email: z.string().email().optional(),
});

/**
 * Crea (o reutiliza, si el telefono ya existe en esta barberia) un
 * cliente desde el panel admin, para el alta manual de turno. Reutiliza
 * EXACTAMENTE la misma logica de busqueda/creacion que usa la reserva
 * publica (buscarOCrearCliente) — no se duplica nada. Ya no se crea
 * Usuario ni password: los clientes no se autentican.
 */
export async function crearClienteManual(
  input: z.infer<typeof esquemaClienteNuevo>
): Promise<ClienteBusqueda> {
  const datos = esquemaClienteNuevo.parse(input);

const session = await requireSession();

const barberia = await requireBarberiaDelDueno({
  usuarioId: session.user.id,
  barberiaId: datos.barberiaId,
});

await requireSuscripcionActiva(
  barberia.id
);

const cliente = await buscarOCrearCliente({
    barberiaId: datos.barberiaId,
    nombre: datos.nombre,
    telefono: datos.telefono,
    email: datos.email,
  });

  return {
    id: cliente.id,
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
  };
}
