import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Input = {
  barberiaId: string;
  mercadopagoSubId: string;
  checkoutUrl: string;

  respuesta: Prisma.InputJsonValue;
};

export async function guardarPreapproval({
  barberiaId,
  mercadopagoSubId,
  checkoutUrl,
  respuesta,
}: Input) {
  console.log("========== GUARDANDO PREAPPROVAL ==========");
  console.log({
    barberiaId,
    mercadopagoSubId,
    checkoutUrl,
  });

  const resultado = await prisma.suscripcion.update({
    where: {
      barberiaId,
    },
    data: {
      mercadopagoSubId,
      checkoutUrl,
      fechaUltimaSincronizacion: new Date(),
      ultimaRespuestaMP: respuesta,
    },
  });

  console.log("========== PREAPPROVAL GUARDADO ==========");
  console.dir(resultado, { depth: null });

  return resultado;
}