"use server";

import { prisma } from "@/lib/prisma";
import { verificarSlotLibre } from "@/lib/disponibilidad";
import { buscarOCrearCliente } from "@/lib/actions/clientes";
import { z } from "zod";
import { requireSession } from "@/lib/auth/requireSession";
import { requireBarberiaDelDueno } from "@/lib/actions/guards/requireBarberiaDelDueno";
import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";
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

/**
 * Crea un turno a partir de un clienteId YA RESUELTO. Esta es la pieza
 * central de creacion de turnos: valida disponibilidad y crea el
 * registro. La usan tanto crearTurnoConDatosCliente (reserva publica,
 * resuelve el cliente por telefono primero) como crearTurnoManual
 * (panel admin, donde el cliente ya se eligio de un buscador).
 */
async function crearTurnoInterno(input: z.infer<typeof esquemaTurno>) {
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

 return prisma.$transaction(async (tx) => {
  return tx.turno.create({
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
});
}

export async function crearTurnoAdmin(
  input: z.infer<typeof esquemaTurno>
) {
  const datos = esquemaTurno.parse(input);

  const session = await requireSession();

  const barberia = await requireBarberiaDelDueno({
    usuarioId: session.user.id,
    barberiaId: datos.barberiaId,
  });

  await requireSuscripcionActiva(
    barberia.id
  );

  return crearTurnoInterno(datos);
}

const esquemaTurnoConDatosCliente = z.object({
  barberiaId: z.string(),
  servicioId: z.string(),
  barberoId: z.string(),
  fecha: z.string(),
  horaInicio: z.string(),
  duracionMinutos: z.number(),
  precio: z.number(),
  // Datos del cliente, tomados directo del formulario de reserva publica.
  // NO hay clienteId: se resuelve por telefono, sin login, sin Usuario.
  nombre: z.string().min(2),
  telefono: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  observaciones: z.string().optional(),
});

/**
 * Punto de entrada para la RESERVA PUBLICA (sin login). Resuelve el
 * Cliente por barberiaId+telefono (creandolo si no existe) y despues
 * reutiliza exactamente la misma `crearTurno` de arriba — no se duplica
 * ninguna logica de validacion de slot ni de calculo de horaFin.
 */
export async function crearTurnoConDatosCliente(
  input: z.infer<typeof esquemaTurnoConDatosCliente>
) {
  const datos = esquemaTurnoConDatosCliente.parse(input);

await requireSuscripcionActiva(
  datos.barberiaId
);
  const cliente = await buscarOCrearCliente({
    barberiaId: datos.barberiaId,
    nombre: datos.nombre,
    telefono: datos.telefono,
    email: datos.email || undefined,
    observaciones: datos.observaciones,
  });

  return crearTurnoInterno({
    barberiaId: datos.barberiaId,
    servicioId: datos.servicioId,
    barberoId: datos.barberoId,
    clienteId: cliente.id,
    fecha: datos.fecha,
    horaInicio: datos.horaInicio,
    duracionMinutos: datos.duracionMinutos,
    precio: datos.precio,
  });
}
