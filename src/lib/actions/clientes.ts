import { prisma } from "@/lib/prisma";
import type { Cliente } from "@prisma/client";

import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";

export type DatosCliente = {
  barberiaId: string;
  nombre: string;
  telefono: string;
  email?: string;
  observaciones?: string;
};

/**
 * Busca un Cliente existente por barberiaId + telefono. Si existe, lo
 * reutiliza (actualizando nombre/email/observaciones si vinieron datos
 * nuevos, para no perder informacion mas reciente que el cliente haya
 * dado). Si no existe, lo crea.
 *
 * Esta es la UNICA forma de obtener un clienteId para crear un turno, ya
 * sea desde la reserva publica (sin login) o desde el alta manual en el
 * panel admin. Nunca se crea un Usuario ni una sesion para el cliente.
 */
export async function buscarOCrearCliente(datos: DatosCliente): Promise<Cliente> {

    await requireSuscripcionActiva(
    datos.barberiaId
  );
  const existente = await prisma.cliente.findUnique({
    where: {
      barberiaId_telefono: {
        barberiaId: datos.barberiaId,
        telefono: datos.telefono,
      },
    },
  });

  if (existente) {
    // Actualizamos datos si vinieron valores nuevos, para mantener la
    // info del cliente al dia sin perder su historial de turnos.
    return prisma.cliente.update({
      where: { id: existente.id },
      data: {
        nombre: datos.nombre || existente.nombre,
        email: datos.email ?? existente.email,
        observaciones: datos.observaciones ?? existente.observaciones,
      },
    });
  }

  return prisma.cliente.create({
    data: {
      barberiaId: datos.barberiaId,
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email,
      observaciones: datos.observaciones,
    },
  });
}
