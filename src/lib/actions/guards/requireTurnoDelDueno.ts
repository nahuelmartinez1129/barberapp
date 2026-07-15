/**
 * Verifica que el turno exista y que pertenezca a una barbería
 * donde el usuario autenticado sea el dueño.
 * Devuelve el turno con todas las relaciones necesarias para
 * evitar consultas repetidas a la base de datos.
 */

import { prisma } from "@/lib/prisma";

type Input = {
  usuarioId: string;
  turnoId: string;
};

export async function requireTurnoDelDueno({
  usuarioId,
  turnoId,
}: Input) {
  const turno = await prisma.turno.findUnique({
    where: {
      id: turnoId,
    },

    include: {
      barberia: {
        include: {
          miembros: {
            where: {
              usuarioId,
              rol: "DUENO",
              activo: true,
            },
          },

          suscripcion: true,
        },
      },

      cliente: true,
      servicio: true,
      barbero: {
        include: {
          usuario: true,
        },
      },
    },
  });

  if (!turno) {
    throw new Error("El turno no existe.");
  }

  if (turno.barberia.miembros.length === 0) {
    throw new Error(
      "No tenés permisos para acceder a este turno."
    );
  }

  return turno;
}