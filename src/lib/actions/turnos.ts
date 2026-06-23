"use server";

import { prisma } from "@/lib/prisma";
import { verificarSlotLibre } from "@/lib/disponibilidad";
import { z } from "zod";

const esquemaTurno = z.object({
  barberiaId: z.string(),
  servicioId: z.string(),
  barberoId: z.string(),
  clienteId: z.string(),
  fecha: z.string(),
  horaInicio: z.string(),
  duracionMinutos: z.number(),
  precio: z.number(),
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

export async function crearTurno(input: z.infer<typeof esquemaTurno>) {
  const datos = esquemaTurno.parse(input);
  const fecha = new Date(datos.fecha);
  const horaFin = sumarMinutos(datos.horaInicio, datos.duracionMinutos);

  // Revalidar que el horario sigue libre (evita que dos clientes reserven el mismo slot)
  const libre = await verificarSlotLibre({
    barberoId: datos.barberoId,
    fecha,
    horaInicio: datos.horaInicio,
    horaFin,
  });

  if (!libre) {
    throw new Error("Ese horario ya fue reservado por otra persona.");
  }

  return prisma.turno.create({
    data: {
      barberiaId: datos.barberiaId,
      servicioId: datos.servicioId,
      barberoId: datos.barberoId,
      clienteId: datos.clienteId,
      fecha,
      horaInicio: datos.horaInicio,
      horaFin,
      precioCobrado: datos.precio,
      estado: "PENDIENTE",
    },
  });
}
