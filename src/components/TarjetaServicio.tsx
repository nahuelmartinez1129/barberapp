"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatearMoneda } from "@/lib/utils";
import { actualizarEstadoServicio, eliminarServicio } from "@/lib/actions/servicios";
import { FormularioServicio } from "@/components/FormularioServicio";

type Barbero = {
  id: string;
  usuario: { nombre: string };
};

type Servicio = {
  id: string;
  nombre: string;
  precio: string;
  duracionMinutos: number;
  activo: boolean;
  barberosAsignados: { id: string; barbero: { id: string; usuario: { nombre: string } } }[];
};

export function TarjetaServicio({
  servicio,
  barberiaId,
  barberos,
}: {
  servicio: Servicio;
  barberiaId: string;
  barberos: Barbero[];
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  if (editando) {
    return (
      <FormularioServicio
        barberiaId={barberiaId}
        barberos={barberos}
        servicioExistente={{
          id: servicio.id,
          nombre: servicio.nombre,
          precio: servicio.precio,
          duracionMinutos: servicio.duracionMinutos,
          barberoIdsAsignados: servicio.barberosAsignados.map((bs) => bs.barbero.id),
        }}
        onCancelar={() => setEditando(false)}
        onGuardado={() => setEditando(false)}
      />
    );
  }

  async function togglePausa() {
    setCargando(true);
    await actualizarEstadoServicio(servicio.id, !servicio.activo);
    router.refresh();
    setCargando(false);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${servicio.nombre}"? Esta acción no se puede deshacer.`)) return;
    setCargando(true);
    setError("");
    try {
      await eliminarServicio(servicio.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "No se pudo eliminar.");
      setCargando(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="font-medium text-brand-900 truncate">{servicio.nombre}</p>
        <span
          className={`badge shrink-0 ${
            servicio.activo
              ? "bg-success-50 text-success-700"
              : "bg-brand-100 text-brand-500"
          }`}
        >
          {servicio.activo ? "Activo" : "Pausado"}
        </span>
      </div>
      <p className="text-sm text-brand-500 mb-3">
        {formatearMoneda(servicio.precio)} · {servicio.duracionMinutos} min
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {servicio.barberosAsignados.length === 0 && (
          <span className="text-xs text-brand-400">Ningún barbero asignado todavía</span>
        )}
        {servicio.barberosAsignados.map((bs) => (
          <span
            key={bs.id}
            className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-md"
          >
            {bs.barbero.usuario.nombre}
          </span>
        ))}
      </div>

      {error && (
        <p className="text-xs text-danger-700 mb-2">{error}</p>
      )}

      <div className="flex gap-3 text-xs">
        <button
          onClick={() => setEditando(true)}
          disabled={cargando}
          className="text-brand-600 hover:text-brand-900 underline"
        >
          Editar
        </button>
        <button
          onClick={togglePausa}
          disabled={cargando}
          className="text-brand-600 hover:text-brand-900 underline"
        >
          {servicio.activo ? "Pausar" : "Activar"}
        </button>
        <button
          onClick={eliminar}
          disabled={cargando}
          className="text-brand-400 hover:text-danger-700 underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
