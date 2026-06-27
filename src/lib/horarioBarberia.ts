import { prisma } from "@/lib/prisma";

import {
  NOMBRES_DIA,
  ORDEN_VISUAL_DIAS,
  type DiaHorario,
} from "@/lib/diasSemana";

export type DiaHorarioBarberia = DiaHorario;

/**
 * Horario por defecto cuando una barberia todavia no configuro nada:
 * Lunes a Viernes 09:00-19:00, Sabado 09:00-14:00, Domingo cerrado.
 */
function horarioPorDefecto(): DiaHorarioBarberia[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dia) => {
    if (dia === 0) {
      // Domingo: cerrado
      return { diaSemana: 0, activo: false, horaInicio: "09:00", horaFin: "19:00" };
    }
    if (dia === 6) {
      // Sabado: horario reducido
      return { diaSemana: 6, activo: true, horaInicio: "09:00", horaFin: "14:00" };
    }
    // Lunes a viernes
    return { diaSemana: dia, activo: true, horaInicio: "09:00", horaFin: "19:00" };
  });
}

/**
 * Devuelve el horario de atencion de la barberia. Si todavia no tiene
 * ningun registro cargado, lo crea automaticamente con el horario por
 * defecto (Lun-Vie 09-19, Sab 09-14, Dom cerrado) y lo persiste, para que
 * la disponibilidad de turnos tenga siempre una base valida desde el inicio.
 */
export async function obtenerHorarioBarberia(
  barberiaId: string
): Promise<DiaHorarioBarberia[]> {
  const existentes = await prisma.horarioBarberia.findMany({
    where: { barberiaId },
  });

  if (existentes.length === 0) {
    const porDefecto = horarioPorDefecto();
    await prisma.horarioBarberia.createMany({
      data: porDefecto.map((d) => ({
        barberiaId,
        diaSemana: d.diaSemana,
        activo: d.activo,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
      })),
    });
    return porDefecto;
  }

  // Por seguridad, si faltara algun dia (ej. se agrego manualmente solo
  // algunos), completamos los faltantes con el default para ese dia.
  if (existentes.length < 7) {
    const diasExistentes = new Set(existentes.map((e) => e.diaSemana));
    const faltantes = horarioPorDefecto().filter((d) => !diasExistentes.has(d.diaSemana));
    if (faltantes.length > 0) {
      await prisma.horarioBarberia.createMany({
        data: faltantes.map((d) => ({
          barberiaId,
          diaSemana: d.diaSemana,
          activo: d.activo,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin,
        })),
      });
    }
    const completo = await prisma.horarioBarberia.findMany({ where: { barberiaId } });
    return completo.map((h) => ({
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

/**
 * Devuelve el horario de un dia puntual de la barberia, o null si no hay
 * registro (no deberia pasar tras obtenerHorarioBarberia, pero por las
 * dudas para uso directo desde la logica de disponibilidad).
 */
export async function obtenerHorarioBarberiaDelDia(
  barberiaId: string,
  diaSemana: number
): Promise<DiaHorarioBarberia | null> {
  const horario = await prisma.horarioBarberia.findUnique({
    where: { barberiaId_diaSemana: { barberiaId, diaSemana } },
  });
  if (!horario) return null;
  return {
    diaSemana: horario.diaSemana,
    activo: horario.activo,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
  };
}
