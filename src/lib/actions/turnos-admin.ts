"use server";

import { prisma } from "@/lib/prisma";
import type { EstadoTurno } from "@prisma/client";
import { verificarSlotLibre } from "@/lib/disponibilidad";
import { crearTurnoAdmin } from "@/lib/actions/turnos";
import { z } from "zod";

import { requireSession } from "@/lib/auth/requireSession";
import { requireTurnoDelDueno } from "@/lib/actions/guards/requireTurnoDelDueno";
import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";

export async function cambiarEstadoTurno(
  turnoId: string,
  estado: EstadoTurno
) {
  const session = await requireSession();

  const turno = await requireTurnoDelDueno({
    usuarioId: session.user.id,
    turnoId,
  });

  await requireSuscripcionActiva(
    turno.barberia.id
  );

  return prisma.turno.update({
    where: {
      id: turnoId,
    },
    data: {
      estado,
    },
  });
}

const esquemaTurnoManual = z.object({
  barberiaId: z.string(),
  servicioId: z.string(),
  barberoId: z.string(),
  clienteId: z.string(),
  fecha: z.string(),
  horaInicio: z.string(),
  duracionMinutos: z.number(),
  precio: z.number(),
});

/**
 * Crea un turno desde el panel del admin (alta manual, sin pasar por la
 * reserva online). Reutiliza EXACTAMENTE la misma `crearTurno` que usa
 * el flujo publico (incluida la revalidacion de slot libre con
 * verificarSlotLibre), para no duplicar la logica de creacion de turnos.
 * El estado inicial sigue siendo PENDIENTE, igual que una reserva online.
 */
export async function crearTurnoManual(
  input: z.infer<typeof esquemaTurnoManual>
) {
  const datos = esquemaTurnoManual.parse(input);

  return crearTurnoAdmin(datos);
}

const esquemaReprogramar = z.object({
  turnoId: z.string(),
  fecha: z.string(),
  horaInicio: z.string(),
  duracionMinutos: z.number(),
  // barberoId es opcional: el panel del barbero reprograma sin poder
  // cambiar de barbero, el panel del admin si puede cambiarlo.
  barberoId: z.string().optional(),
});

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Reprograma un turno existente (fecha/horario, y opcionalmente barbero).
 * Reutiliza `verificarSlotLibre` (la misma funcion que usa crearTurno)
 * pasando `excluirTurnoId` para que el propio turno no bloquee su nuevo
 * horario contra si mismo. Usado tanto desde el panel del admin (puede
 * cambiar barbero) como desde el panel del barbero (no puede, por eso el
 * componente que llama a esta action simplemente no manda barberoId).
 */
export async function reprogramarTurno(input: z.infer<typeof esquemaReprogramar>) {
const datos = esquemaReprogramar.parse(input);

const session = await requireSession();

const turno = await requireTurnoDelDueno({
  usuarioId: session.user.id,
  turnoId: datos.turnoId,
});

await requireSuscripcionActiva(
  turno.barberia.id
);

const barberoId =
  datos.barberoId ?? turno.barberoId;

const fecha = new Date(datos.fecha);

const horaFin = sumarMinutos(
  datos.horaInicio,
  datos.duracionMinutos
);

  const libre = await verificarSlotLibre({
    barberoId,
    fecha,
    horaInicio: datos.horaInicio,
    horaFin,
    excluirTurnoId: datos.turnoId,
  });

  if (!libre) {
    throw new Error("Ese horario ya no está disponible. Elegí otro.");
  }

return prisma.turno.update({
  where: {
    id: datos.turnoId,
  },
  data: {
    barberoId,
    fecha,
    horaInicio: datos.horaInicio,
    horaFin,
  },
});
}
