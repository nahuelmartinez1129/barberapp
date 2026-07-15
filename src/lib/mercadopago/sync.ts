import { prisma } from "@/lib/prisma";

import { obtenerPreapproval } from "./helpers/obtenerPreapproval";
import { mapEstadoMercadoPago } from "./helpers/mapEstado";
import { mapPreapproval } from "./helpers/mapPreapproval";
import { actualizarSuscripcionMP } from "./helpers/actualizarSuscripcion";

export async function syncPreapproval(
  mercadopagoSubId: string
) {
  console.log("========== SYNC PREAPPROVAL ==========");

  const mp = await obtenerPreapproval(mercadopagoSubId);

  if (!mp.status) {
    throw new Error(
      "Mercado Pago no devolvió el estado de la suscripción."
    );
  }

  const estado = mapEstadoMercadoPago(mp.status);

  const fechaProximoPago = mp.next_payment_date
    ? new Date(mp.next_payment_date)
    : null;

  const respuesta = mapPreapproval(mp);

  await prisma.$transaction(async () => {
    await actualizarSuscripcionMP({
      mercadopagoSubId,
      estado,
      fechaProximoPago,
      respuesta,
    });
  });

  return respuesta;
}