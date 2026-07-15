import { syncPreapproval } from "./sync";

type WebhookBody = {
  type?: string;

  action?: string;

  data?: {
    id?: string;
  };
};

export async function procesarWebhookMercadoPago(
  body: WebhookBody
) {
  console.log("========== WEBHOOK ==========");

  console.dir(body, {
    depth: null,
  });

  if (!body.type || !body.data?.id) {
    return;
  }

  switch (body.type) {
    case "subscription_preapproval":

      await syncPreapproval(body.data.id);

      break;

    default:

      console.log(
        "Evento ignorado:",
        body.type
      );

      break;
  }
}