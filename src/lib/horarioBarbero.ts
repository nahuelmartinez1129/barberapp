import { prisma } from "@/lib/prisma";
import { type DiaHorario } from "@/lib/diasSemana";

/**
 * Horario individual por defecto para un barbero nuevo:
 * Lunes a Sabado 09:00-19:00, Domingo inactivo.
 */
function horarioBarberoPorDefecto(): DiaHorario[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
    diaSemana: dia,
    activo: dia !== 0, // domingo (0) inactivo
    horaInicio: "09:00",
    horaFin: "19:00",
  }));
}

/**
 * Devuelve el horario semanal de un barbero (HorarioAtencion). Si por
 * algun motivo no tiene los 7 dias cargados (por ejemplo, barberos dados
 * de alta antes de esta funcionalidad), completa los dias faltantes con
 * el default y los persiste, igual que ya hace obtenerHorarioBarberia
 * para la barberia.
 */
export async function obtenerHorarioBarbero(barberoId: string): Promise<DiaHorario[]> {
  const existentes = await prisma.horarioAtencion.findMany({
    where: { barberoId },
  });
  console.log(existentes);

  if (existentes.length === 0) {
    const porDefecto = horarioBarberoPorDefecto();
    await prisma.horarioAtencion.createMany({
      data: porDefecto.map((d) => ({
        barberoId,
        diaSemana: d.diaSemana,
        activo: d.activo,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
      })),
    });
    return porDefecto;
  }

  if (existentes.length < 7) {
    const diasExistentes = new Set(existentes.map((e) => e.diaSemana));
    const faltantes = horarioBarberoPorDefecto().filter(
      (d) => !diasExistentes.has(d.diaSemana)
    );
    if (faltantes.length > 0) {
      await prisma.horarioAtencion.createMany({
        data: faltantes.map((d) => ({
          barberoId,
          diaSemana: d.diaSemana,
          activo: d.activo,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin,
        })),
      });
    }
    const completo = await prisma.horarioAtencion.findMany({ where: { barberoId } });
    return completo
      .sort((a, b) => a.diaSemana - b.diaSemana)
      .map((h) => ({
        diaSemana: h.diaSemana,
        activo: h.activo,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
      }));
  }

  return existentes
    .sort((a, b) => a.diaSemana - b.diaSemana)
    .map((h) => ({
      diaSemana: h.diaSemana,
      activo: h.activo,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
    }));
}
