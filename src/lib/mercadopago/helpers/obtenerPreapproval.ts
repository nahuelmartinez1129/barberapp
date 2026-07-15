import { PreApproval } from "mercadopago";

import { mercadoPagoClient } from "../client";

const preApproval = new PreApproval(mercadoPagoClient);

export async function obtenerPreapproval(
  id: string
) {
  const respuesta = await preApproval.get({
    id,
  });

  if (!respuesta.id) {
    throw new Error(
      "Mercado Pago no devolvió una suscripción válida."
    );
  }

  return respuesta;
}