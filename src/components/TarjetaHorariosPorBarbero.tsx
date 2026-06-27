"use client";

import { useState, useEffect } from "react";
import { type DiaHorario } from "@/lib/diasSemana";
import { FormularioHorarioBarbero } from "@/components/FormularioHorarioBarbero";

type Barbero = {
  id: string;
  nombre: string;
};

export function TarjetaHorariosPorBarbero({
  barberos,
  horarioInicial,
}: {
  barberos: Barbero[];
  horarioInicial: DiaHorario[]; // horario del primer barbero, precargado desde el server
}) {
  const [barberoId, setBarberoId] = useState(barberos[0]?.id ?? "");
  const [horario, setHorario] = useState<DiaHorario[]>(horarioInicial);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // El horario del barbero inicial ya vino precargado por el server,
    // asi que evitamos un fetch innecesario apenas se monta el componente.
    if (barberoId === barberos[0]?.id) {
      setHorario(horarioInicial);
      return;
    }

    if (!barberoId) return;

    setCargando(true);
    fetch(`/api/horario-barbero?barberoId=${barberoId}`)
      .then((r) => r.json())
      .then((data) => setHorario(data.horario ?? []))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberoId]);

  return (
    <div className="card space-y-4">
      <div>
        <p className="font-medium text-brand-900 mb-3">Horarios por barbero</p>

        {barberos.length === 0 ? (
          <p className="text-sm text-brand-400">
            Todavía no agregaste ningún barbero. Creá uno desde la sección
            "Barberos" para poder configurar su horario.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">
              Seleccionar barbero
            </label>
            <select
              value={barberoId}
              onChange={(e) => setBarberoId(e.target.value)}
              className="input-base max-w-xs"
            >
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {barberos.length > 0 && (
        <>
          {cargando ? (
            <p className="text-sm text-brand-400">Cargando horario...</p>
          ) : (
            <FormularioHorarioBarbero barberoId={barberoId} horarioInicial={horario} />
          )}
        </>
      )}
    </div>
  );
}
