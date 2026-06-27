"use client";

import { useState, useEffect } from "react";

/**
 * Selector de fecha + horario disponible, reutilizable desde cualquier
 * modal del panel admin/barbero. Llama al MISMO endpoint
 * /api/disponibilidad que ya usa ReservaWizard (reserva publica), que a
 * su vez usa obtenerHorariosDisponibles. No se duplica ningun calculo de
 * disponibilidad: este componente solo es la UI que consume ese mismo
 * endpoint.
 */
export function SelectorHorarioDisponible({
  barberiaId,
  barberoId,
  duracionMinutos,
  fecha,
  onCambiarFecha,
  horario,
  onCambiarHorario,
  excluirTurnoId,
  fechaMinima,
}: {
  barberiaId: string;
  barberoId: string;
  duracionMinutos: number;
  fecha: string;
  onCambiarFecha: (fecha: string) => void;
  horario: string | null;
  onCambiarHorario: (horario: string) => void;
  excluirTurnoId?: string;
  fechaMinima?: string;
}) {
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!barberoId || !fecha) return;

    setCargando(true);
    const params = new URLSearchParams({
      barberiaId,
      barberoId,
      fecha,
      duracion: String(duracionMinutos),
    });
    if (excluirTurnoId) params.set("excluirTurnoId", excluirTurnoId);

    fetch(`/api/disponibilidad?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setHorariosDisponibles(data.horarios ?? []))
      .finally(() => setCargando(false));
  }, [barberiaId, barberoId, fecha, duracionMinutos, excluirTurnoId]);

  return (
    <div>
      <input
        type="date"
        value={fecha}
        min={fechaMinima ?? new Date().toISOString().split("T")[0]}
        onChange={(e) => onCambiarFecha(e.target.value)}
        className="input-base mb-3"
      />

      {cargando && <p className="text-sm text-brand-400">Buscando horarios...</p>}

      {!cargando && horariosDisponibles.length === 0 && (
        <p className="text-sm text-brand-400">No hay horarios disponibles para este día.</p>
      )}

      {!cargando && horariosDisponibles.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {horariosDisponibles.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onCambiarHorario(h)}
              className={`text-center py-2 rounded-md text-sm transition-colors ${
                horario === h
                  ? "border-2 border-accent-500 bg-accent-50 text-accent-700 font-medium"
                  : "border border-brand-200 text-brand-700"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
