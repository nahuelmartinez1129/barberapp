"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatearMoneda, iniciales, cn } from "@/lib/utils";
import { cambiarEstadoTurno } from "@/lib/actions/turnos-admin";

type Turno = {
  id: string;
  fecha: string; // ISO
  horaInicio: string;
  estado: string;
  precioCobrado: string;
  clienteNombre: string;
  servicioNombre: string;
  barberoId: string;
  barberoNombre: string;
  barberoColor: string;
};

type Barbero = {
  id: string;
  nombre: string;
};

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

export function ListaTurnos({
  turnos,
  barberos,
  fechaInicial,
}: {
  turnos: Turno[];
  barberos: Barbero[];
  fechaInicial: string;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(fechaInicial);
  const [barberoId, setBarberoId] = useState("todos");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      const coincideFecha = t.fecha.slice(0, 10) === fecha;
      const coincideBarbero = barberoId === "todos" || t.barberoId === barberoId;
      return coincideFecha && coincideBarbero;
    });
  }, [turnos, fecha, barberoId]);

  async function actualizar(turnoId: string, estado: string) {
    setActualizandoId(turnoId);
    await cambiarEstadoTurno(turnoId, estado as any);
    router.refresh();
    setActualizandoId(null);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input-base sm:w-auto"
        />
        <select
          value={barberoId}
          onChange={(e) => setBarberoId(e.target.value)}
          className="input-base sm:w-auto"
        >
          <option value="todos">Todos los barberos</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>

      {turnosFiltrados.length === 0 && (
        <p className="text-sm text-brand-400">No hay turnos para este filtro.</p>
      )}

      <div className="space-y-2">
        {turnosFiltrados.map((t) => (
          <div
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-brand-100 rounded-md px-4 py-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm text-brand-400 w-12 shrink-0">{t.horaInicio}</span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white shrink-0"
                style={{ backgroundColor: t.barberoColor }}
              >
                {iniciales(t.barberoNombre)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-brand-900 truncate">
                  {t.clienteNombre} · {t.servicioNombre}
                </p>
                <p className="text-xs text-brand-400">{formatearMoneda(t.precioCobrado)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("badge", ESTILO_ESTADO[t.estado])}>
                {ETIQUETA_ESTADO[t.estado]}
              </span>
             {!["COMPLETADO", "CANCELADO", "NO_ASISTIO"].includes(t.estado) && (
  <>
    <button
      disabled={actualizandoId === t.id}
      onClick={() => actualizar(t.id, "COMPLETADO")}
      className="text-xs text-brand-500 hover:text-brand-900 underline"
    >
      Completar
    </button>

    <button
      disabled={actualizandoId === t.id}
      onClick={() => actualizar(t.id, "NO_ASISTIO")}
      className="text-xs text-orange-600 hover:text-orange-800 underline"
    >
      No asistió
    </button>

    <button
      disabled={actualizandoId === t.id}
      onClick={() => actualizar(t.id, "CANCELADO")}
      className="text-xs text-brand-400 hover:text-danger-700 underline"
    >
      Cancelar
    </button>
  </>
)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
