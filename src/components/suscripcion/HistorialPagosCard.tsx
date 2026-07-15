export function HistorialPagosCard() {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-brand-500">
            Historial de pagos
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-brand-900">
            Facturación
          </h2>

        </div>

      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-brand-100">

        <table className="w-full">

          <thead className="bg-brand-50">

            <tr>

              <th className="px-5 py-3 text-left text-sm font-medium text-brand-600">
                Fecha
              </th>

              <th className="px-5 py-3 text-left text-sm font-medium text-brand-600">
                Estado
              </th>

              <th className="px-5 py-3 text-right text-sm font-medium text-brand-600">
                Monto
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={3}
                className="px-5 py-10 text-center text-brand-400"
              >

                Todavía no registrás ningún pago.

                <div className="mt-2 text-sm">
                  Cuando actives tu suscripción aparecerán aquí
                  todas las facturas y pagos realizados.
                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}