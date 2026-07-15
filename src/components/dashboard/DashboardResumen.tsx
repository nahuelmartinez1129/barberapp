import { cn, formatearFecha, iniciales } from "@/lib/utils";
import { TarjetaPaginaPublica } from "./TarjetaPaginaPublica";
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

type Props = {
  slug: string;

  hoy: Date;

  metricas: {
    label: string;
    valor: string;
  }[];

  turnosHoy: any[];
};

export function DashboardResumen({
  slug,
  hoy,
  metricas,
  turnosHoy,
}: Props) {
  return (
    <div>
      <TarjetaPaginaPublica slug={slug} />
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-6">
        
        <h1 className="text-lg font-medium text-brand-900">
          Resumen de hoy
        </h1>

        <span className="text-sm text-brand-400 capitalize">
          {formatearFecha(hoy)}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {metricas.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-brand-100 rounded-md p-4"
          >
            <p className="text-xs text-brand-400 mb-1">
              {m.label}
            </p>

            <p className="text-2xl font-medium text-brand-900">
              {m.valor}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium text-brand-700 mb-3">
        Agenda de hoy
      </h2>

      <div className="space-y-2">
        {turnosHoy.length === 0 && (
          <p className="text-sm text-brand-400">
            No hay turnos para hoy.
          </p>
        )}

        {turnosHoy.map((turno) => (
          <div
            key={turno.id}
            className="flex items-center gap-3 bg-white border border-brand-100 rounded-md px-4 py-3"
          >
            <span className="text-sm text-brand-400 w-12 shrink-0">
              {turno.horaInicio}
            </span>

            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-medium text-brand-600 shrink-0">
              {iniciales(turno.barbero.usuario.nombre)}
            </div>

            <span className="text-sm text-brand-900 flex-1 truncate">
              {turno.cliente.nombre} · {turno.servicio.nombre}
            </span>

            <span
              className={cn(
                "badge shrink-0",
                ESTILO_ESTADO[turno.estado]
              )}
            >
              {ETIQUETA_ESTADO[turno.estado]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}