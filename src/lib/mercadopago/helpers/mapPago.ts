type Payment = {
  id?: string;
  status?: string;
  transaction_amount?: number;
  currency_id?: string;
  description?: string;
  date_created?: string;
  date_approved?: string;
};

export function mapPago(payment: Payment) {
  return {
    id: payment.id ?? null,

    estado: payment.status ?? null,

    monto: payment.transaction_amount ?? 0,

    moneda: payment.currency_id ?? "ARS",

    descripcion: payment.description ?? null,

    fechaCreacion: payment.date_created ?? null,

    fechaAprobacion: payment.date_approved ?? null,
  };
}