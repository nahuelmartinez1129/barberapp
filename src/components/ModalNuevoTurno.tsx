"use client";

import { useState, useEffect } from "react";
import { formatearMoneda } from "@/lib/utils";
import { buscarClientesBarberia, crearClienteManual, type ClienteBusqueda } from "@/lib/actions/clientes-admin";
import { crearTurnoManual } from "@/lib/actions/turnos-admin";
import { ModalBase } from "@/components/ModalBase";
import { SelectorHorarioDisponible } from "@/components/SelectorHorarioDisponible";

type Barbero = {
  id: string;
  nombre: string;
};

type Servicio = {
  id: string;
  nombre: string;
  precio: string;
  duracionMinutos: number;
  barberoIds: string[]; // ids de barberos asignados a este servicio
};

export function ModalNuevoTurno({
  barberiaId,
  barberos,
  servicios,
  onCerrar,
  onCreado,
}: {
  barberiaId: string;
  barberos: Barbero[];
  servicios: Servicio[];
  onCerrar: () => void;
  onCreado: () => void;
}) {
  // --- busqueda / alta de cliente ---
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null);
  const [mostrandoAltaCliente, setMostrandoAltaCliente] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");

  // --- servicio / barbero / horario ---
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [barberoId, setBarberoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [horario, setHorario] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const servicioActivo = servicios.find((s) => s.id === servicioId);
  // Solo se usa cuando servicioActivo existe (el bloque que lo renderiza
  // esta condicionado a eso), pero se calcula siempre por simplicidad.
  const barberosDelServicio = servicioActivo
    ? barberos.filter((b) => servicioActivo.barberoIds.includes(b.id))
    : [];

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(() => {
      buscarClientesBarberia(barberiaId, busqueda.trim())
        .then(setResultados)
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [busqueda, barberiaId]);

  async function manejarCrearCliente() {
    if (!nombreNuevo.trim() || !telefonoNuevo.trim()) {
      setError("Completá nombre y teléfono del cliente nuevo.");
      return;
    }
    setError("");
    try {
      const nuevo = await crearClienteManual({
        barberiaId,
        nombre: nombreNuevo,
        telefono: telefonoNuevo,
      });
      setClienteSeleccionado(nuevo);
      setMostrandoAltaCliente(false);
      setBusqueda("");
      setResultados([]);
    } catch (err: any) {
      setError(err.message ?? "No se pudo crear el cliente.");
    }
  }

  async function manejarConfirmar() {
    if (!clienteSeleccionado || !servicioActivo || !barberoId || !horario) return;

    setGuardando(true);
    setError("");
    try {
      await crearTurnoManual({
        barberiaId,
        servicioId: servicioActivo.id,
        barberoId,
        clienteId: clienteSeleccionado.id,
        fecha,
        horaInicio: horario,
        duracionMinutos: servicioActivo.duracionMinutos,
        precio: parseFloat(servicioActivo.precio),
      });
      onCreado();
    } catch (err: any) {
      setError(err.message ?? "No se pudo crear el turno. Probá otro horario.");
      setHorario(null);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalBase titulo="Nuevo turno" onCerrar={onCerrar}>
      <div className="space-y-5">
        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Paso 1: cliente */}
        <div>
          <p className="text-xs font-medium text-brand-400 mb-2">Cliente</p>

          {clienteSeleccionado ? (
            <div className="flex items-center justify-between border border-brand-200 rounded-md px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-brand-900">
                  {clienteSeleccionado.nombre}
                </p>
                {clienteSeleccionado.telefono && (
                  <p className="text-xs text-brand-400">{clienteSeleccionado.telefono}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setClienteSeleccionado(null)}
                className="text-xs text-brand-500 underline"
              >
                Cambiar
              </button>
            </div>
          ) : mostrandoAltaCliente ? (
            <div className="space-y-2 border border-brand-200 rounded-md p-3.5">
              <input
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                placeholder="Nombre completo"
                className="input-base"
              />
              <input
                value={telefonoNuevo}
                onChange={(e) => setTelefonoNuevo(e.target.value)}
                placeholder="Teléfono"
                className="input-base"
              />
              <div className="flex gap-2">
                <button type="button" onClick={manejarCrearCliente} className="btn-primary flex-1">
                  Crear cliente
                </button>
                <button
                  type="button"
                  onClick={() => setMostrandoAltaCliente(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="input-base mb-2"
              />
              {buscando && <p className="text-xs text-brand-400">Buscando...</p>}
              {!buscando && resultados.length > 0 && (
                <div className="space-y-1 mb-2">
                  {resultados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClienteSeleccionado(c)}
                      className="w-full text-left px-3 py-2 rounded-md border border-brand-100 hover:bg-brand-50 text-sm"
                    >
                      <span className="font-medium text-brand-900">{c.nombre}</span>
                      {c.telefono && (
                        <span className="text-brand-400"> · {c.telefono}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {!buscando && busqueda.trim().length >= 2 && resultados.length === 0 && (
                <p className="text-xs text-brand-400 mb-2">Sin resultados.</p>
              )}
              <button
                type="button"
                onClick={() => setMostrandoAltaCliente(true)}
                className="text-xs text-accent-600 underline"
              >
                + Crear cliente nuevo
              </button>
            </div>
          )}
        </div>

        {/* Paso 2: servicio */}
        <div>
          <p className="text-xs font-medium text-brand-400 mb-2">Servicio</p>
          <div className="space-y-2">
            {servicios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setServicioId(s.id);
                  setBarberoId(null);
                  setHorario(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md text-left transition-colors ${
                  servicioId === s.id
                    ? "border-2 border-accent-500 bg-accent-50"
                    : "border border-brand-200"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    servicioId === s.id ? "text-accent-700" : "text-brand-800"
                  }`}
                >
                  {s.nombre}
                </span>
                <span
                  className={`text-xs ${
                    servicioId === s.id ? "text-accent-700" : "text-brand-400"
                  }`}
                >
                  {formatearMoneda(s.precio)} · {s.duracionMinutos} min
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Paso 3: barbero */}
        {servicioActivo && (
          <div>
            <p className="text-xs font-medium text-brand-400 mb-2">Barbero</p>
            {barberosDelServicio.length === 0 ? (
              <p className="text-sm text-brand-400">
                Por ahora no hay barberos disponibles para este servicio.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {barberosDelServicio.map((b) => (
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
            )}
          </div>
        )}

        {/* Paso 4: fecha y horario, reutilizando el mismo calculo de disponibilidad */}
        {barberoId && servicioActivo && (
          <div>
            <p className="text-xs font-medium text-brand-400 mb-2">Fecha y horario</p>
            <SelectorHorarioDisponible
              barberiaId={barberiaId}
              barberoId={barberoId}
              duracionMinutos={servicioActivo.duracionMinutos}
              fecha={fecha}
              onCambiarFecha={(f) => {
                setFecha(f);
                setHorario(null);
              }}
              horario={horario}
              onCambiarHorario={setHorario}
            />
          </div>
        )}

        <button
          type="button"
          onClick={manejarConfirmar}
          disabled={!clienteSeleccionado || !horario || guardando}
          className="btn-primary w-full"
        >
          {guardando ? "Creando..." : "Crear turno"}
        </button>
      </div>
    </ModalBase>
  );
}
