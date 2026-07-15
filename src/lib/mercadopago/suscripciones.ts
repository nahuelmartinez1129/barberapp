import { PlanSuscripcion } from "@prisma/client";
import { PreApproval } from "mercadopago";

import { mercadoPagoClient } from "./client";
import { construirPreapproval } from "./builders/preapproval";
import { guardarPreapproval } from "./helpers/guardarPreapproval";

export const preApproval = new PreApproval(mercadoPagoClient);

type Input = {
  barberiaId: string;
  email: string;
  plan: PlanSuscripcion;
  successUrl: string;
  backUrl: string;
};

export async function crearSuscripcionMercadoPago(
  input: Input
) {
  console.log(
  "ENTRANDO A crearSuscripcionMercadoPago"
);
  const payload = construirPreapproval(input);

  console.log("========== PAYLOAD ==========");
  console.dir(payload, { depth: null });

  try {
    const respuesta = await preApproval.create({
      body: payload,
    });

    console.log("========== RESPUESTA ==========");
    console.dir(respuesta, { depth: null });

    if (!respuesta.id || !respuesta.init_point) {
  throw new Error(
    "Mercado Pago no devolvió el id o el init_point de la suscripción."
  );
}

   await guardarPreapproval({
  barberiaId: input.barberiaId,

  mercadopagoSubId: respuesta.id,

  checkoutUrl: respuesta.init_point,

  respuesta: {
    id: respuesta.id,
    status: respuesta.status,
    reason: respuesta.reason,
    init_point: respuesta.init_point,
    external_reference: respuesta.external_reference,
    payer_email: respuesta.payer_email,
    date_created: respuesta.date_created,
    next_payment_date: respuesta.next_payment_date,
  },
});

    return {
      id: respuesta.id,
      initPoint: respuesta.init_point,
      status: respuesta.status,
    };
  } catch (error) {
    console.log("========== ERROR MERCADO PAGO ==========");
    console.dir(error, { depth: null });

    throw error;
  }
}