import {
  EstadoPago,
  Prisma,
  Suscripcion,
} from "@prisma/client";

type Input = {
  tx: Prisma.TransactionClient;

  suscripcion: Suscripcion;

  respuestaMP: {
    id: string;
    status: string;
    transaction_amount?: number | null;
    currency_id?: string | null;
    reason?: string | null;
  };
};

export async function registrarPago({
  tx,
  suscripcion,
  respuestaMP,
}: Input) {
  // Si Mercado Pago todavía no autorizó la suscripción,
  // todavía no existe un pago para registrar.
  if (respuestaMP.status !== "authorized") {
    return;
  }

  // Evitamos registrar el mismo pago dos veces.
  const pagoExistente =
    await tx.pagoSuscripcion.findFirst({
      where: {
        mercadopagoId: respuestaMP.id,
      },
    });

  if (pagoExistente) {
    return pagoExistente;
  }

  return tx.pagoSuscripcion.create({
    data: {
      suscripcionId: suscripcion.id,

      mercadopagoId: respuestaMP.id,

      monto: new Prisma.Decimal(
        respuestaMP.transaction_amount ?? 0
      ),

      moneda: respuestaMP.currency_id ?? "ARS",

      descripcion:
        respuestaMP.reason ??
        "Suscripción BarberApp",

      estado: EstadoPago.APROBADO,
    },
  });
}