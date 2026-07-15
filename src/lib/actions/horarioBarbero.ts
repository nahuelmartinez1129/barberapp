"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { requireSuscripcionBarbero } from "@/lib/actions/guards/requireSuscripcionBarbero";

const esquemaDia = z.object({
  diaSemana: z.number().int().min(0).max(6),
  activo: z.boolean(),
  horaInicio: z.string(),
  horaFin: z.string(),
});

const esquemaGuardarHorarioBarbero = z.object({
  barberoId: z.string(),
  dias: z.array(esquemaDia).length(7),
});

export async function guardarHorarioBarbero(
  input: z.infer<typeof esquemaGuardarHorarioBarbero>
) {
  const datos = esquemaGuardarHorarioBarbero.parse(input);

  await requireSuscripcionBarbero(
    datos.barberoId
);

  for (const dia of datos.dias) {
    if (dia.activo && dia.horaInicio >= dia.horaFin) {
      throw new Error(
        "La hora de cierre debe ser posterior a la hora de apertura en todos los días activos."
      );
    }
  }

  
  await prisma.$transaction(
    datos.dias.map((dia) =>
      prisma.horarioAtencion.upsert({
        where: {
          barberoId_diaSemana: {
            barberoId: datos.barberoId,
            diaSemana: dia.diaSemana,
          },
        },
        update: {
          activo: dia.activo,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin,
        },
        create: {
          barberoId: datos.barberoId,
          diaSemana: dia.diaSemana,
          activo: dia.activo,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin,
        },
      })
    )
  );
}
