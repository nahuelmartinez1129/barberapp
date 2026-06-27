import { prisma } from "@/lib/prisma";
import { obtenerHorarioBarberiaDelDia } from "@/lib/horarioBarberia";

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
 * - el horario general de atencion de la BARBERIA (HorarioBarberia)
 * - su horario habitual de atencion individual (HorarioAtencion)
 * - turnos que ya tiene reservados (Turno)
 * - bloqueos manuales (BloqueoHorario, ej. almuerzo, vacaciones)
 * - la duracion del servicio que el cliente quiere reservar
 *
 * La jornada efectiva es la INTERSECCION entre el horario de la barberia
 * y el horario del barbero: un turno solo es valido si cae dentro de
 * ambos. Si la barberia esta cerrada ese dia, no hay disponibilidad sin
 * importar el horario configurado para el barbero.
 *
 * `excluirTurnoId` es opcional y se usa al REPROGRAMAR un turno existente:
 * permite que el propio turno que se esta moviendo no cuente como
 * "ocupado" contra si mismo (si no, su horario actual jamas aparaceria
 * como disponible). No afecta a los callers existentes que no lo pasan
 * (reserva publica, alta manual de turno nuevo).
 */
export async function obtenerHorariosDisponibles({
  barberiaId,
  barberoId,
  fecha,
  duracionMinutos,
  excluirTurnoId,
}: {
  barberiaId: string;
  barberoId: string;
  fecha: Date;
  duracionMinutos: number;
  excluirTurnoId?: string;
}): Promise<string[]> {
  const diaSemana = fecha.getDay();

  const [horarioBarberiaDia, horarioAtencion] = await Promise.all([
    obtenerHorarioBarberiaDelDia(barberiaId, diaSemana),
    prisma.horarioAtencion.findUnique({
      where: { barberoId_diaSemana: { barberoId, diaSemana } },
    }),
  ]);

  // Si la barberia esta cerrada ese dia, no hay disponibilidad para ningun
  // barbero, aunque el barbero tenga horario configurado para ese dia.
  if (!horarioBarberiaDia || !horarioBarberiaDia.activo) {
    return [];
  }

  if (!horarioAtencion || !horarioAtencion.activo) {
    return []; // el barbero no atiende ese dia
  }

  // Interseccion: el inicio efectivo es el mas tardio de los dos, y el
  // fin efectivo es el mas temprano de los dos.
  const inicioJornada = Math.max(
    horaAMinutos(horarioBarberiaDia.horaInicio),
    horaAMinutos(horarioAtencion.horaInicio)
  );
  const finJornada = Math.min(
    horaAMinutos(horarioBarberiaDia.horaFin),
    horaAMinutos(horarioAtencion.horaFin)
  );

  if (inicioJornada >= finJornada) {
    return []; // no hay superposicion entre ambos horarios ese dia
  }

  // Turnos ya reservados ese dia (cualquier estado excepto cancelado),
  // excluyendo el turno que se esta reprogramando (si corresponde).
  const inicioDelDia = new Date(fecha);
  inicioDelDia.setHours(0, 0, 0, 0);
  const finDelDia = new Date(fecha);
  finDelDia.setHours(23, 59, 59, 999);

  const turnosExistentes = await prisma.turno.findMany({
    where: {
      barberoId,
      fecha: { gte: inicioDelDia, lte: finDelDia },
      estado: { not: "CANCELADO" },
      ...(excluirTurnoId ? { id: { not: excluirTurnoId } } : {}),
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
 * (evita condiciones de carrera entre dos clientes reservando el mismo slot).
 *
 * `excluirTurnoId` es opcional, mismo proposito que en
 * obtenerHorariosDisponibles: al reprogramar, el propio turno no debe
 * contar como ocupado contra si mismo.
 */
export async function verificarSlotLibre({
  barberoId,
  fecha,
  horaInicio,
  horaFin,
  excluirTurnoId,
}: {
  barberoId: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  excluirTurnoId?: string;
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
      ...(excluirTurnoId ? { id: { not: excluirTurnoId } } : {}),
    },
    select: { horaInicio: true, horaFin: true },
  });

  return !turnosExistentes.some((t) => {
    const inicioExistente = horaAMinutos(t.horaInicio);
    const finExistente = horaAMinutos(t.horaFin);
    return inicioNuevo < finExistente && finNuevo > inicioExistente;
  });
}
