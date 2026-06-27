"use client";

import { useState } from "react";
import { reprogramarTurno } from "@/lib/actions/turnos-admin";
import { ModalBase } from "@/components/ModalBase";
import { SelectorHorarioDisponible } from "@/components/SelectorHorarioDisponible";

type Barbero = {
  id: string;
  nombre: string;
};

export type TurnoAReprogramar = {
  id: string;
  barberiaId: string;
  barberoId: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
  clienteNombre: string;
  servicioNombre: string;
  barberoNombre: string;
};

export function ModalReprogramarTurno({
  turno,
  permitirCambiarBarbero = false,
  barberosDisponibles = [],
  onCerrar,
  onGuardado,
}: {
  turno: TurnoAReprogramar;
  permitirCambiarBarbero?: boolean;
  barberosDisponibles?: Barbero[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [barberoId, setBarberoId] = useState(turno.barberoId);
  const [fecha, setFecha] = useState(turno.fecha);
  const [horario, setHorario] = useState<string | null>(turno.horaInicio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const nombreBarberoActual =
    barberosDisponibles.find((b) => b.id === barberoId)?.nombre ?? turno.barberoNombre;

  async function manejarGuardar() {
    if (!horario) return;

    setGuardando(true);
    setError("");
    try {
      await reprogramarTurno({
        turnoId: turno.id,
        fecha,
        horaInicio: horario,
        duracionMinutos: turno.duracionMinutos,
        barberoId: permitirCambiarBarbero ? barberoId : undefined,
      });
      onGuardado();
    } catch (err: any) {
      setError(err.message ?? "No se pudo reprogramar el turno. Probá otro horario.");
      setHorario(null);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalBase titulo="Reprogramar turno" onCerrar={onCerrar}>
      <div className="space-y-5">
        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-brand-50 rounded-md p-3 text-sm space-y-0.5">
          <p className="text-brand-900 font-medium">{turno.clienteNombre}</p>
          <p className="text-brand-500">{turno.servicioNombre}</p>
          <p className="text-brand-500">Con {nombreBarberoActual}</p>
        </div>

        {permitirCambiarBarbero && barberosDisponibles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-brand-400 mb-2">Barbero</p>
            <div className="flex flex-wrap gap-2">
              {barberosDisponibles.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBarberoId(b.id);
                    setHorario(null);
                  }}
                  className={`px-3.5 py-2 rounded-md text-sm transition-colors ${
                    barberoId === b.id
                      ? "border-2 border-accent-500 bg-accent-50 text-accent-700 font-medium"
                      : "border border-brand-200 text-brand-700"
                  }`}
                >
                  {b.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-brand-400 mb-2">Nueva fecha y horario</p>
          <SelectorHorarioDisponible
            barberiaId={turno.barberiaId}
            barberoId={barberoId}
            duracionMinutos={turno.duracionMinutos}
            fecha={fecha}
            onCambiarFecha={(f) => {
              setFecha(f);
              setHorario(null);
            }}
            horario={horario}
            onCambiarHorario={setHorario}
            excluirTurnoId={turno.id}
          />
        </div>

        <button
          type="button"
          onClick={manejarGuardar}
          disabled={!horario || guardando}
          className="btn-primary w-full"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ModalBase>
  );
}
