"use client";

import { useState } from "react";
import { NOMBRES_DIA, ORDEN_VISUAL_DIAS, type DiaHorario } from "@/lib/diasSemana";

/**
 * Editor generico de horario semanal (7 dias, activo + hora inicio/fin).
 * No sabe si esta editando el horario de una BARBERIA o de un BARBERO:
 * solo recibe el horario inicial y un callback `onGuardar` que recibe los
 * 7 dias ya armados, en el orden visual Lunes->Domingo convertido a
 * diaSemana real (0=domingo...6=sabado).
 *
 * Esto permite reutilizar exactamente el mismo formulario (mismo diseño,
 * mismos inputs, mismos estilos) tanto para "Horarios de la barbería"
 * como para "Horarios por barbero", sin duplicar el JSX.
 */
export function EditorHorarioSemanal({
  titulo,
  horarioInicial,
  onGuardar,
  textoBoton = "Guardar horarios",
}: {
  titulo: string;
  horarioInicial: DiaHorario[];
  onGuardar: (dias: DiaHorario[]) => Promise<void>;
  textoBoton?: string;
}) {
  // Indexamos por diaSemana para edicion facil, manteniendo siempre los 7 dias
  const [dias, setDias] = useState<Record<number, DiaHorario>>(() => {
    const mapa: Record<number, DiaHorario> = {};
    for (const d of horarioInicial) mapa[d.diaSemana] = { ...d };
    return mapa;
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(
    null
  );

  function actualizarDia(diaSemana: number, cambios: Partial<DiaHorario>) {
    setDias((prev) => ({
      ...prev,
      [diaSemana]: { ...prev[diaSemana], ...cambios },
    }));
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);

    try {
      await onGuardar(ORDEN_VISUAL_DIAS.map((diaSemana) => dias[diaSemana]));
      setMensaje({ tipo: "exito", texto: "Horarios guardados correctamente." });
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message ?? "No se pudieron guardar los horarios. Intentá de nuevo.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-4">
      <p className="font-medium text-brand-900">{titulo}</p>

      {mensaje && (
        <div
          className={`text-sm px-3 py-2 rounded-md ${
            mensaje.tipo === "exito"
              ? "bg-success-50 text-success-700"
              : "bg-danger-50 text-danger-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="space-y-3">
        {ORDEN_VISUAL_DIAS.map((diaSemana) => {
          const dia = dias[diaSemana];
          if (!dia) return null;

          return (
            <div
              key={diaSemana}
              className="flex flex-col sm:flex-row sm:items-center gap-3 border border-brand-100 rounded-md px-4 py-3"
            >
              <div className="flex items-center gap-2.5 sm:w-40 shrink-0">
                <input
                  type="checkbox"
                  checked={dia.activo}
                  onChange={(e) => actualizarDia(diaSemana, { activo: e.target.checked })}
                  className="rounded border-brand-300"
                  id={`activo-${diaSemana}`}
                />
                <label
                  htmlFor={`activo-${diaSemana}`}
                  className="text-sm font-medium text-brand-900"
                >
                  {NOMBRES_DIA[diaSemana]}
                </label>
              </div>

              {dia.activo ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={dia.horaInicio}
                    onChange={(e) => actualizarDia(diaSemana, { horaInicio: e.target.value })}
                    className="input-base w-auto"
                  />
                  <span className="text-brand-400 text-sm">a</span>
                  <input
                    type="time"
                    value={dia.horaFin}
                    onChange={(e) => actualizarDia(diaSemana, { horaFin: e.target.value })}
                    className="input-base w-auto"
                  />
                </div>
              ) : (
                <span className="text-sm text-brand-400">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" disabled={guardando} className="btn-primary">
        {guardando ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
