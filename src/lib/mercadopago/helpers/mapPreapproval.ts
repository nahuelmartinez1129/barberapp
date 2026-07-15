type Preapproval = {
  id?: string;
  status?: string;
  reason?: string;
  init_point?: string;
  external_reference?: string;
  payer_email?: string;
  next_payment_date?: string;
  date_created?: string;
};

export function mapPreapproval(mp: Preapproval) {
  return {
    id: mp.id ?? null,
    status: mp.status ?? null,
    reason: mp.reason ?? null,
    init_point: mp.init_point ?? null,
    external_reference: mp.external_reference ?? null,
    payer_email: mp.payer_email ?? null,
    next_payment_date: mp.next_payment_date ?? null,
    date_created: mp.date_created ?? null,
  };
}