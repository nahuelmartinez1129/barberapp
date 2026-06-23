import { prisma } from "@/lib/prisma";

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Calcula los horarios disponibles para un barbero en una fecha dada,
 * considerando:
 * - su horario habitual de atencion (HorarioAtencion)
 * - turnos que ya tiene reservados (Turno)
 * - bloqueos manuales (BloqueoHorario, ej. almuerzo, vacaciones)
 * - la duracion del servicio que el cliente quiere reservar
 */
export async function obtenerHorariosDisponibles({
  barberoId,
  fecha,
  duracionMinutos,
}: {
  barberoId: string;
  fecha: Date;
  duracionMinutos: number;
}): Promise<string[]> {
  const diaSemana = fecha.getDay();

  const horarioAtencion = await prisma.horarioAtencion.findUnique({
    where: { barberoId_diaSemana: { barberoId, diaSemana } },
  });

  if (!horarioAtencion || !horarioAtencion.activo) {
    return []; // el barbero no atiende ese dia
  }

  const inicioJornada = horaAMinutos(horarioAtencion.horaInicio);
  const finJornada = horaAMinutos(horarioAtencion.horaFin);

  // Turnos ya reservados ese dia (cualquier estado excepto cancelado)
  const inicioDelDia = new Date(fecha);
  inicioDelDia.setHours(0, 0, 0, 0);
  const finDelDia = new Date(fecha);
  finDelDia.setHours(23, 59, 59, 999);

  const turnosExistentes = await prisma.turno.findMany({
    where: {
      barberoId,
      fecha: { gte: inicioDelDia, lte: finDelDia },
      estado: { not: "CANCELADO" },
    },
    select: { horaInicio: true, horaFin: true },
  });

  const bloqueos = await prisma.bloqueoHorario.findMany({
    where: {
      barberoId,
      fecha: { gte: inicioDelDia, lte: finDelDia },
    },
    select: { horaInicio: true, horaFin: true },
  });

  // Intervalos ocupados (turnos + bloqueos), en minutos
  const ocupados = [...turnosExistentes, ...bloqueos].map((t) => ({
    inicio: horaAMinutos(t.horaInicio),
    fin: horaAMinutos(t.horaFin),
  }));

  const disponibles: string[] = [];
  const intervaloSlot = 15; // los horarios se ofrecen cada 15 min

  for (
    let inicioCandidato = inicioJornada;
    inicioCandidato + duracionMinutos <= finJornada;
    inicioCandidato += intervaloSlot
  ) {
    const finCandidato = inicioCandidato + duracionMinutos;

    const seSuperponeConOcupado = ocupados.some(
      (o) => inicioCandidato < o.fin && finCandidato > o.inicio
    );

    if (!seSuperponeConOcupado) {
      disponibles.push(minutosAHora(inicioCandidato));
    }
  }

  return disponibles;
}

/**
 * Verifica si un turno propuesto sigue libre justo antes de confirmarlo
 * (evita condiciones de carrera entre dos clientes reservando el mismo slot)
 */
export async function verificarSlotLibre({
  barberoId,
  fecha,
  horaInicio,
  horaFin,
}: {
  barberoId: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
}): Promise<boolean> {
  const inicioDelDia = new Date(fecha);
  inicioDelDia.setHours(0, 0, 0, 0);
  const finDelDia = new Date(fecha);
  finDelDia.setHours(23, 59, 59, 999);

  const inicioNuevo = horaAMinutos(horaInicio);
  const finNuevo = horaAMinutos(horaFin);

  const turnosExistentes = await prisma.turno.findMany({
    where: {
      barberoId,
      fecha: { gte: inicioDelDia, lte: finDelDia },
      estado: { not: "CANCELADO" },
    },
    select: { horaInicio: true, horaFin: true },
  });

  return !turnosExistentes.some((t) => {
    const inicioExistente = horaAMinutos(t.horaInicio);
    const finExistente = horaAMinutos(t.horaFin);
    return inicioNuevo < finExistente && finNuevo > inicioExistente;
  });
}
