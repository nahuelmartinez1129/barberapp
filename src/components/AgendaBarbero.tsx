"use client";

import { useState } from "react";
import { formatearMoneda, iniciales } from "@/lib/utils";
import { actualizarEstadoTurnoBarbero } from "@/lib/actions/barbero";

type Turno = {
  id: string;
  horaInicio: string;
  clienteNombre: string;
  servicioNombre: string;
  duracionMinutos: number;
  precio: string;
  estado: string;
};

export function AgendaBarbero({
  nombreBarbero,
  turnos: turnosIniciales,
}: {
  nombreBarbero: string;
  turnos: Turno[];
}) {
  const [turnos, setTurnos] = useState(turnosIniciales);

  const completados = turnos.filter((t) => t.estado === "COMPLETADO");
  const pendientes = turnos.filter((t) => t.estado === "PENDIENTE" ||t.estado === "CONFIRMADO");
  const proximo = pendientes[0];
  const restoDelDia = pendientes.slice(1);

  const ingresosHoy = completados.reduce(
    (acc, t) => acc + parseFloat(t.precio),
    0
  );

async function actualizarEstado(
  turnoId: string,
  estado: string
) {
  setTurnos((prev) =>
    prev.map((t) =>
      t.id === turnoId
        ? { ...t, estado }
        : t
    )
  );

  await actualizarEstadoTurnoBarbero(
    turnoId,
    estado as any
  );
}

  return (
    <div className="max-w-sm mx-auto bg-white border border-brand-100 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-sm font-medium text-accent-700">
          {iniciales(nombreBarbero)}
        </div>
        <div>
          <p className="font-medium text-brand-900">Hola, {nombreBarbero.split(" ")[0]}</p>
          <p className="text-xs text-brand-400">Tenés {pendientes.length} turnos hoy</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-brand-50 rounded-md p-2.5 text-center">
            <p className="text-lg font-medium text-brand-900">{completados.length}</p>
            <p className="text-[11px] text-brand-400">Completados</p>
          </div>
          <div className="flex-1 bg-brand-50 rounded-md p-2.5 text-center">
            <p className="text-lg font-medium text-brand-900">{pendientes.length}</p>
            <p className="text-[11px] text-brand-400">Restantes</p>
          </div>
          <div className="flex-1 bg-brand-50 rounded-md p-2.5 text-center">
            <p className="text-lg font-medium text-brand-900">{formatearMoneda(ingresosHoy)}</p>
            <p className="text-[11px] text-brand-400">Hoy</p>
          </div>
        </div>

        {proximo && (
          <>
            <p className="text-xs font-medium text-brand-400 mb-2">Próximo turno</p>
            <div className="border-2 border-accent-500 bg-accent-50 rounded-md p-3.5 mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-accent-700">
                  {proximo.clienteNombre}
                </span>
                <span className="text-sm font-medium text-accent-700">
                  {proximo.horaInicio}
                </span>
              </div>
              <p className="text-xs text-accent-700">
                {proximo.servicioNombre} · {proximo.duracionMinutos} min
              </p>
             <div className="grid grid-cols-3 gap-2 mt-3">
  <button
    onClick={() => actualizarEstado(proximo.id, "COMPLETADO")}
    className="py-2 bg-green-600 text-white rounded-md text-sm"
  >
    Completar
  </button>

  <button
    onClick={() => actualizarEstado(proximo.id, "NO_ASISTIO")}
    className="py-2 bg-orange-500 text-white rounded-md text-sm"
  >
    No asistió
  </button>

  <button
    onClick={() => actualizarEstado(proximo.id, "CANCELADO")}
    className="py-2 bg-red-600 text-white rounded-md text-sm"
  >
    Cancelar
  </button>
</div>
            </div>
          </>
        )}

        {restoDelDia.length > 0 && (
          <>
            <p className="text-xs font-medium text-brand-400 mb-2">Resto del día</p>
            <div className="space-y-1.5">
              {restoDelDia.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 border border-brand-200 rounded-md px-3 py-2.5"
                >
                  <span className="text-sm text-brand-700 flex-1">
                    {t.horaInicio} · {t.clienteNombre}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {pendientes.length === 0 && (
          <p className="text-sm text-brand-400 text-center py-4">
            No tenés más turnos por hoy.
          </p>
        )}
      </div>
    </div>
  );
}
