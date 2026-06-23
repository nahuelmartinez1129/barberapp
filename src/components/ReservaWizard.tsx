"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatearMoneda, iniciales } from "@/lib/utils";
import { crearTurno } from "@/lib/actions/turnos";

type Barbero = {
  id: string;
  usuario: { nombre: string };
};

type Servicio = {
  id: string;
  nombre: string;
  precio: any;
  duracionMinutos: number;
  barberosAsignados: { barbero: Barbero }[];
};

type Barberia = {
  id: string;
  nombre: string;
  slug: string;
};

export function ReservaWizard({
  barberia,
  servicios,
}: {
  barberia: Barberia;
  servicios: Servicio[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [barberoId, setBarberoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [horario, setHorario] = useState<string | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [reservaOk, setReservaOk] = useState(false);
  const [error, setError] = useState("");

  const servicioActivo = servicios.find((s) => s.id === servicioId);
  // Solo barberos que tienen asignado el servicio elegido
  const barberosDisponibles = servicioActivo
    ? servicioActivo.barberosAsignados.map((bs) => bs.barbero)
    : [];

  // Al cambiar servicio, barbero u horario disponible, resetear seleccion de horario
  useEffect(() => {
    setHorario(null);
    setHorariosDisponibles([]);

    if (!barberoId || !servicioActivo) return;

    setCargandoHorarios(true);
    fetch(
      `/api/disponibilidad?barberoId=${barberoId}&fecha=${fecha}&duracion=${servicioActivo.duracionMinutos}`
    )
      .then((r) => r.json())
      .then((data) => setHorariosDisponibles(data.horarios ?? []))
      .finally(() => setCargandoHorarios(false));
  }, [barberoId, fecha, servicioActivo]);

  async function confirmarReserva() {
    if (!session?.user) {
      setError("Necesitás iniciar sesión para reservar un turno.");
      return;
    }
    if (!servicioId || !barberoId || !horario) return;

    setConfirmando(true);
    setError("");
    try {
      await crearTurno({
        barberiaId: barberia.id,
        servicioId,
        barberoId,
        clienteId: session.user.id,
        fecha,
        horaInicio: horario,
        duracionMinutos: servicioActivo!.duracionMinutos,
        precio: parseFloat(servicioActivo!.precio.toString()),
      });

      router.refresh();
      setReservaOk(true);
    } catch (err: any) {
      setError(err.message ?? "Ese horario ya no está disponible. Elegí otro.");
      setHorario(null);
    } finally {
      setConfirmando(false);
    }
  }

  if (reservaOk) {
    return (
      <div className="max-w-md mx-auto card text-center">
        <p className="font-medium text-brand-900 mb-1">¡Turno confirmado!</p>
        <p className="text-sm text-brand-500">
          {servicioActivo?.nombre} el {fecha} a las {horario}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-brand-100 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-100">
        <p className="font-medium text-brand-900">{barberia.nombre}</p>
        <p className="text-xs text-brand-400">Reservá tu turno online</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Paso 1: servicio */}
        <div>
          <p className="text-xs font-medium text-brand-400 mb-2">1. Elegí el servicio</p>
          <div className="space-y-2">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServicioId(s.id);
                  setBarberoId(null);
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
                  {formatearMoneda(s.precio.toString())} · {s.duracionMinutos} min
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Paso 2: barbero (filtrado por servicio elegido) */}
        {servicioActivo && (
          <div>
            <p className="text-xs font-medium text-brand-400 mb-2">2. Elegí el barbero</p>
            {barberosDisponibles.length === 0 ? (
              <p className="text-sm text-brand-400">
                Por ahora no hay barberos disponibles para este servicio.
              </p>
            ) : (
              <div className="flex gap-2">
                {barberosDisponibles.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBarberoId(b.id)}
                    className={`flex-1 text-center px-2 py-2.5 rounded-md transition-colors ${
                      barberoId === b.id
                        ? "border-2 border-accent-500 bg-accent-50"
                        : "border border-brand-200"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-medium ${
                        barberoId === b.id
                          ? "bg-white text-accent-700"
                          : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      {iniciales(b.usuario.nombre)}
                    </div>
                    <span
                      className={`text-xs ${
                        barberoId === b.id ? "text-accent-700 font-medium" : "text-brand-700"
                      }`}
                    >
                      {b.usuario.nombre.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 3: fecha y horario */}
        {barberoId && (
          <div>
            <p className="text-xs font-medium text-brand-400 mb-2">3. Elegí día y horario</p>
            <input
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFecha(e.target.value)}
              className="input-base mb-3"
            />

            {cargandoHorarios && (
              <p className="text-sm text-brand-400">Buscando horarios...</p>
            )}

            {!cargandoHorarios && horariosDisponibles.length === 0 && (
              <p className="text-sm text-brand-400">
                No hay horarios disponibles ese día. Probá otra fecha.
              </p>
            )}

            {!cargandoHorarios && horariosDisponibles.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {horariosDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorario(h)}
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
        )}

        {error && (
          <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={confirmarReserva}
          disabled={!horario || confirmando}
          className="btn-primary w-full"
        >
          {confirmando ? "Confirmando..." : "Confirmar turno"}
        </button>

        {!session?.user && (
          <p className="text-xs text-center text-brand-400">
            Necesitás <a href="/login" className="text-accent-600 underline">iniciar sesión</a> para confirmar
          </p>
        )}
      </div>
    </div>
  );
}
