"use server";

import { z } from "zod";
import { syncPreapproval } from "@/lib/mercadopago/sync";
import { prisma } from "@/lib/prisma";

import { requireSession } from "@/lib/auth/requireSession";

import { requireBarberiaDelDueno } from "@/lib/actions/guards/requireBarberiaDelDueno";

const esquema = z.object({
  mercadopagoSubId: z.string().min(10),
});

export async function sincronizarSuscripcion(
  mercadopagoSubId: string
) {
 const datos = esquema.parse({
  mercadopagoSubId,
});

const session = await requireSession();

const suscripcion =
  await prisma.suscripcion.findUnique({
    where: {
      mercadopagoSubId:
        datos.mercadopagoSubId,
    },
  });

if (!suscripcion) {
  throw new Error(
    "Suscripción no encontrada."
  );
}

await requireBarberiaDelDueno({
  usuarioId: session.user.id,
  barberiaId: suscripcion.barberiaId,
});

  return syncPreapproval(
    datos.mercadopagoSubId
  );
}