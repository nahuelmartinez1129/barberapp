"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatearMoneda } from "@/lib/utils";
import { cambiarEstadoTurno } from "@/lib/actions/turnos-admin";
import { ModalBase } from "@/components/ModalBase";
import { ModalReprogramarTurno, type TurnoAReprogramar } from "@/components/ModalReprogramarTurno";

type DetalleClienteVista = {
  nombre: string;
  telefono: string | null;
  visitas: number;
  totalGastado: number;
  ultimaVisita: string | null; // ya formateada
  clienteDesde: string | null; // ya formateada
  proximoTurno: {
    id: string;
    fecha: string; // YYYY-MM-DD
    horaInicio: string;
    servicioNombre: string;
    barberoId: string;
    barberoNombre: string;
    duracionMinutos: number;
  } | null;
  historialReciente: {
    id: string;
    fecha: string;
    servicioNombre: string;
    estado: string;
  }[];
};

const ETIQUETA_ESTADO: Record<string, string> = {
  CONFIRMADO: "Confirmado",
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
  NO_ASISTIO: "No asistió",
};

export function ModalVistaCliente({
  barberiaId,
  clienteId,
  onCerrar,
}: {
  barberiaId: string;
  clienteId: string;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [detalle, setDetalle] = useState<DetalleClienteVista | null>(null);
  const [cargando, setCargando] = useState(true);
  const [reprogramando, setReprogramando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    setCargando(true);
    fetch(`/api/clientes/${clienteId}?barberiaId=${barberiaId}`)
      .then((r) => r.json())
      .then((data) => setDetalle(data.detalle ?? null))
      .finally(() => setCargando(false));
  }, [barberiaId, clienteId]);

  async function manejarCambioEstado(estado: "COMPLETADO" | "CANCELADO") {
    if (!detalle?.proximoTurno) return;
    setActualizando(true);
    await cambiarEstadoTurno(detalle.proximoTurno.id, estado);
    router.refresh();
    onCerrar();
  }

  if (reprogramando && detalle?.proximoTurno) {
    const turnoParaReprogramar: TurnoAReprogramar = {
      id: detalle.proximoTurno.id,
      barberiaId,
      barberoId: detalle.proximoTurno.barberoId,
      fecha: detalle.proximoTurno.fecha,
      horaInicio: detalle.proximoTurno.horaInicio,
      duracionMinutos: detalle.proximoTurno.duracionMinutos,
      clienteNombre: detalle.nombre,
      servicioNombre: detalle.proximoTurno.servicioNombre,
      barberoNombre: detalle.proximoTurno.barberoNombre,
    };

    return (
      <ModalReprogramarTurno
        turno={turnoParaReprogramar}
        permitirCambiarBarbero
        onCerrar={() => setReprogramando(false)}
        onGuardado={() => {
          router.refresh();
          onCerrar();
        }}
      />
    );
  }

  return (
    <ModalBase titulo={detalle ? detalle.nombre : "Cliente"} onCerrar={onCerrar}>
      {cargando && <p className="text-sm text-brand-400">Cargando...</p>}

      {!cargando && !detalle && (
        <p className="text-sm text-brand-400">No se pudo cargar la información del cliente.</p>
      )}

      {!cargando && detalle && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {detalle.telefono && (
              <div>
                <p className="text-xs text-brand-400">Teléfono</p>
                <p className="text-brand-900">{detalle.telefono}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-brand-400">Cliente desde</p>
              <p className="text-brand-900">{detalle.clienteDesde ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-brand-400">Visitas</p>
              <p className="text-brand-900">{detalle.visitas}</p>
            </div>
            <div>
              <p className="text-xs text-brand-400">Total gastado</p>
              <p className="text-brand-900">{formatearMoneda(detalle.totalGastado)}</p>
            </div>
            <div>
              <p className="text-xs text-brand-400">Última visita</p>
              <p className="text-brand-900">{detalle.ultimaVisita ?? "—"}</p>
            </div>
          </div>

          {detalle.proximoTurno && (
            <div>
              <p className="text-xs font-medium text-brand-400 mb-2">Próximo turno</p>
              <div className="border border-accent-500 bg-accent-50 rounded-md p-3 text-sm">
                <p className="text-accent-700 font-medium">
                  {detalle.proximoTurno.servicioNombre}
                </p>
                <p className="text-accent-700">
                  {detalle.proximoTurno.fecha} · {detalle.proximoTurno.horaInicio} con{" "}
                  {detalle.proximoTurno.barberoNombre}
                </p>
              </div>
            </div>
          )}

          {detalle.historialReciente.length > 0 && (
            <div>
              <p className="text-xs font-medium text-brand-400 mb-2">Últimos turnos</p>
              <div className="space-y-1">
                {detalle.historialReciente.map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="text-brand-700">
                      {t.fecha} · {t.servicioNombre}
                    </span>
                    <span className="text-brand-400">{ETIQUETA_ESTADO[t.estado]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detalle.proximoTurno && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-100">
              <button
                type="button"
                onClick={() => setReprogramando(true)}
                className="btn-secondary text-sm"
              >
                Reprogramar
              </button>
              <button
                type="button"
                disabled={actualizando}
                onClick={() => manejarCambioEstado("COMPLETADO")}
                className="text-sm text-brand-600 hover:text-brand-900 underline"
              >
                Marcar como completado
              </button>
              <button
                type="button"
                disabled={actualizando}
                onClick={() => manejarCambioEstado("CANCELADO")}
                className="text-sm text-brand-400 hover:text-danger-700 underline"
              >
                Cancelar turno
              </button>
            </div>
          )}
        </div>
      )}
    </ModalBase>
  );
}
