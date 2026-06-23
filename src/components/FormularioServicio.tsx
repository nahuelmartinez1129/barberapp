"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearServicio, editarServicio } from "@/lib/actions/servicios";

type Barbero = {
  id: string;
  usuario: { nombre: string };
};

type ServicioExistente = {
  id: string;
  nombre: string;
  precio: string;
  duracionMinutos: number;
  barberoIdsAsignados: string[];
};

export function FormularioServicio({
  barberiaId,
  barberos,
  servicioExistente,
  onCancelar,
  onGuardado,
}: {
  barberiaId: string;
  barberos: Barbero[];
  servicioExistente?: ServicioExistente;
  onCancelar?: () => void;
  onGuardado?: () => void;
}) {
  const router = useRouter();
  const esEdicion = !!servicioExistente;

  const [nombre, setNombre] = useState(servicioExistente?.nombre ?? "");
  const [precio, setPrecio] = useState(servicioExistente?.precio ?? "");
  const [duracion, setDuracion] = useState(
    servicioExistente ? String(servicioExistente.duracionMinutos) : "30"
  );
  const [barberosSeleccionados, setBarberosSeleccionados] = useState<string[]>(
    servicioExistente?.barberoIdsAsignados ?? []
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function toggleBarbero(id: string) {
    setBarberosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !precio || !duracion) {
      setError("Completá nombre, precio y duración.");
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await editarServicio({
          servicioId: servicioExistente!.id,
          nombre,
          precio: parseFloat(String(precio)),
          duracionMinutos: parseInt(duracion),
          barberoIds: barberosSeleccionados,
        });
        onGuardado?.();
      } else {
        await crearServicio({
          barberiaId,
          nombre,
          precio: parseFloat(String(precio)),
          duracionMinutos: parseInt(duracion),
          barberoIds: barberosSeleccionados,
        });
        setNombre("");
        setPrecio("");
        setDuracion("30");
        setBarberosSeleccionados([]);
      }
      router.refresh();
    } catch (err) {
      setError("No se pudo guardar el servicio. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="card space-y-4 h-fit">
      <p className="font-medium text-brand-900">
        {esEdicion ? "Editar servicio" : "Nuevo servicio"}
      </p>

      {error && (
        <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-base"
          placeholder="Ej: Corte clásico"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            Precio ($)
          </label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="input-base"
            placeholder="8000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            Duración (min)
          </label>
          <input
            type="number"
            step="5"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            className="input-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-2">
          ¿Qué barberos hacen este servicio?
        </label>
        <div className="space-y-1.5">
          {barberos.length === 0 && (
            <p className="text-xs text-brand-400">
              Primero agregá barberos en la sección "Barberos".
            </p>
          )}
          {barberos.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-brand-700">
              <input
                type="checkbox"
                checked={barberosSeleccionados.includes(b.id)}
                onChange={() => toggleBarbero(b.id)}
                className="rounded border-brand-300"
              />
              {b.usuario.nombre}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="btn-primary flex-1">
          {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear servicio"}
        </button>
        {esEdicion && (
          <button type="button" onClick={onCancelar} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
