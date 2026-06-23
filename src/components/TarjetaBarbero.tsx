"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iniciales } from "@/lib/utils";
import { actualizarEstadoBarbero } from "@/lib/actions/barberos-admin";
import { FormularioBarbero } from "@/components/FormularioBarbero";

type Barbero = {
  id: string;
  activo: boolean;
  colorAgenda: string;
  usuario: { nombre: string; email: string; telefono: string | null };
  serviciosAsignados: { id: string; servicio: { nombre: string } }[];
};

export function TarjetaBarbero({
  barbero,
  barberiaId,
}: {
  barbero: Barbero;
  barberiaId: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);

  if (editando) {
    return (
      <FormularioBarbero
        barberiaId={barberiaId}
        barberoExistente={{
          miembroId: barbero.id,
          nombre: barbero.usuario.nombre,
          telefono: barbero.usuario.telefono ?? "",
          colorAgenda: barbero.colorAgenda,
        }}
        onCancelar={() => setEditando(false)}
        onGuardado={() => setEditando(false)}
      />
    );
  }

  async function toggleActivo() {
    setCargando(true);
    await actualizarEstadoBarbero(barbero.id, !barbero.activo);
    router.refresh();
    setCargando(false);
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
          style={{ backgroundColor: barbero.colorAgenda }}
        >
          {iniciales(barbero.usuario.nombre)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-brand-900 truncate">{barbero.usuario.nombre}</p>
          <p className="text-xs text-brand-400 truncate">{barbero.usuario.email}</p>
        </div>
        <span
          className={`badge ml-auto shrink-0 ${
            barbero.activo
              ? "bg-success-50 text-success-700"
              : "bg-brand-100 text-brand-500"
          }`}
        >
          {barbero.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {barbero.serviciosAsignados.length === 0 && (
          <span className="text-xs text-brand-400">Sin servicios asignados</span>
        )}
        {barbero.serviciosAsignados.map((bs) => (
          <span
            key={bs.id}
            className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-md"
          >
            {bs.servicio.nombre}
          </span>
        ))}
      </div>

      <div className="flex gap-3 text-xs">
        <button
          onClick={() => setEditando(true)}
          disabled={cargando}
          className="text-brand-600 hover:text-brand-900 underline"
        >
          Editar
        </button>
        <button
          onClick={toggleActivo}
          disabled={cargando}
          className="text-brand-600 hover:text-brand-900 underline"
        >
          {barbero.activo ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  );
}
