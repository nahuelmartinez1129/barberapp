"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { requireSuscripcionActiva } from "@/lib/actions/guards/requireSuscripcionActiva";

const esquemaDia = z.object({
  diaSemana: z.number().int().min(0).max(6),
  activo: z.boolean(),
  horaInicio: z.string(),
  horaFin: z.string(),
});

const esquemaGuardarHorario = z.object({
  barberiaId: z.string(),
  dias: z.array(esquemaDia).length(7),
});

export async function guardarHorarioBarberia(
  input: z.infer<typeof esquemaGuardarHorario>
) {
  const datos = esquemaGuardarHorario.parse(input);

  await requireSuscripcionActiva(
  datos.barberiaId
);

  // Validación
  for (const dia of datos.dias) {
    if (dia.activo && dia.horaInicio >= dia.horaFin) {
      throw new Error(
        "La hora de cierre debe ser posterior a la hora de apertura en todos los días activos."
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    // Guardar horarios
    for (const dia of datos.dias) {
      await tx.horarioBarberia.upsert({
        where: {
          barberiaId_diaSemana: {
            barberiaId: datos.barberiaId,
            diaSemana: dia.diaSemana,
          },
        },
        update: {
          activo: dia.activo,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin,
        },
        create: {
          barberiaId: datos.barberiaId,
          diaSemana: dia.diaSemana,
          activo: dia.activo,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin,
        },
      });
    }

    // ✅ Marcar onboarding
    await tx.barberia.update({
      where: {
        id: datos.barberiaId,
      },
      data: {
        horariosConfigurados: true,
      },
    });
  });
}