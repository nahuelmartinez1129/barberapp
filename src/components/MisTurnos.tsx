"use client";

import { useState } from "react";
import { formatearMoneda, iniciales } from "@/lib/utils";

type Turno = {
  id: string;
  fecha: string; // ISO
  horaInicio: string;
  estado: string;
  precioCobrado: string;
  servicioNombre: string;
  barberoNombre: string;
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

function formatearFechaCorta(iso: string): string {
  const fecha = new Date(iso);
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(fecha);
}

export function MisTurnos({ turnos }: { turnos: Turno[] }) {
  const [vista, setVista] = useState<"proximos" | "pasados">("proximos");

  const proximos = turnos
  .filter((t) =>
    t.estado === "PENDIENTE" ||
    t.estado === "CONFIRMADO"
  )
  .sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
    const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
    return fechaA.getTime() - fechaB.getTime();
  });

const pasados = turnos
  .filter((t) =>
    t.estado === "COMPLETADO" ||
    t.estado === "CANCELADO" ||
    t.estado === "NO_ASISTIO"
  )
  .sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
    const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
    return fechaB.getTime() - fechaA.getTime();
  });

  const lista = vista === "proximos" ? proximos : pasados;

  return (
    <div className="max-w-md mx-auto bg-white border border-brand-100 rounded-lg overflow-hidden">
      <div className="flex border-b border-brand-100">
        <button
          onClick={() => setVista("proximos")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            vista === "proximos"
              ? "text-brand-900 border-b-2 border-brand-900"
              : "text-brand-400"
          }`}
        >
          Próximos ({proximos.length})
        </button>
        <button
          onClick={() => setVista("pasados")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            vista === "pasados"
              ? "text-brand-900 border-b-2 border-brand-900"
              : "text-brand-400"
          }`}
        >
          Historial ({pasados.length})
        </button>
      </div>

      <div className="p-4 space-y-2">
        {lista.length === 0 && (
          <p className="text-sm text-brand-400 text-center py-6">
            {vista === "proximos"
              ? "No tenés turnos próximos."
              : "Todavía no tenés turnos pasados."}
          </p>
        )}

        {lista.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 border border-brand-100 rounded-md px-3.5 py-3"
          >
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600 shrink-0">
              {iniciales(t.barberoNombre)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-brand-900 truncate">{t.servicioNombre}</p>
              <p className="text-xs text-brand-400">
                {formatearFechaCorta(t.fecha)} · {t.horaInicio} con {t.barberoNombre.split(" ")[0]}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`badge ${ESTILO_ESTADO[t.estado]}`}>
                {ETIQUETA_ESTADO[t.estado]}
              </span>
              <p className="text-xs text-brand-400 mt-1">
                {formatearMoneda(t.precioCobrado)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
