import { PlanSuscripcion } from "@prisma/client";
import { PLANES } from "@/lib/plans";

type Input = {
  email: string;
  plan: PlanSuscripcion;

  successUrl: string;
  backUrl: string;

  barberiaId: string;
};

export function construirPreapproval(input: Input) {
  const plan = PLANES[input.plan];
 console.log("========== EMAIL ENVIADO A MP ==========");
  console.log(input.email);
  return {
    reason: plan.nombre,

    auto_recurring: {
      frequency: plan.frecuencia,

      frequency_type: plan.frecuenciaTipo,

      transaction_amount: plan.precio,

      currency_id: plan.moneda,
    },

    payer_email: input.email,

    back_url: input.backUrl,

    external_reference: input.barberiaId,

    status: "pending",
  };
}