import { formatearMoneda } from "@/lib/utils";
import type { TurnoHistorialCliente } from "@/lib/clientes";

const ESTILO_ESTADO: Record<string, string> = {
  CONFIRMADO: "bg-success-50 text-success-700",
  PENDIENTE: "bg-warning-50 text-warning-700",
  COMPLETADO: "bg-brand-100 text-brand-600",
  CANCELADO: "bg-danger-50 text-danger-700",
  NO_ASISTIO: "bg-danger-50 text-danger-700",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  CONFIRMADO: "Confirmado",
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
  NO_ASISTIO: "No asistió",
};

function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

export function HistorialCliente({ turnos }: { turnos: TurnoHistorialCliente[] }) {
  if (turnos.length === 0) {
    return <p className="text-sm text-brand-400">Este cliente todavía no tiene turnos.</p>;
  }

  return (
    <>
      {/* Tabla en pantallas medianas/grandes */}
      <div className="hidden md:block bg-white border border-brand-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-brand-400">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">Barbero</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id} className="border-b border-brand-50 last:border-0">
                <td className="px-4 py-3 text-brand-700">{formatearFechaCorta(t.fecha)}</td>
                <td className="px-4 py-3 text-brand-900">{t.servicioNombre}</td>
                <td className="px-4 py-3 text-brand-500">{t.barberoNombre}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${ESTILO_ESTADO[t.estado]}`}>
                    {ETIQUETA_ESTADO[t.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-brand-900">
                  {formatearMoneda(t.precioCobrado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en mobile */}
      <div className="md:hidden space-y-2">
        {turnos.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-brand-900 font-medium">{t.servicioNombre}</span>
              <span className={`badge ${ESTILO_ESTADO[t.estado]}`}>
                {ETIQUETA_ESTADO[t.estado]}
              </span>
            </div>
            <div className="flex justify-between text-xs text-brand-500">
              <span>{formatearFechaCorta(t.fecha)} · {t.barberoNombre}</span>
              <span className="text-brand-900 font-medium">
                {formatearMoneda(t.precioCobrado)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
