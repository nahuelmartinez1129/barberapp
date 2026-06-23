"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearBarbero, editarBarbero } from "@/lib/actions/barberos-admin";

const COLORES = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type BarberoExistente = {
  miembroId: string;
  nombre: string;
  telefono: string;
  colorAgenda: string;
};

export function FormularioBarbero({
  barberiaId,
  barberoExistente,
  onCancelar,
  onGuardado,
}: {
  barberiaId: string;
  barberoExistente?: BarberoExistente;
  onCancelar?: () => void;
  onGuardado?: () => void;
}) {
  const router = useRouter();
  const esEdicion = !!barberoExistente;

  const [nombre, setNombre] = useState(barberoExistente?.nombre ?? "");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState(barberoExistente?.telefono ?? "");
  const [color, setColor] = useState(barberoExistente?.colorAgenda ?? COLORES[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [credencialesCreadas, setCredencialesCreadas] = useState<{
    email: string;
    password: string;
  } | null>(null);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || (!esEdicion && !email.trim())) {
      setError("Completá nombre y email.");
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await editarBarbero({
          miembroId: barberoExistente!.miembroId,
          nombre,
          telefono: telefono || undefined,
          colorAgenda: color,
        });
        onGuardado?.();
      } else {
        const { passwordTemporal } = await crearBarbero({
          barberiaId,
          nombre,
          email,
          telefono: telefono || undefined,
          colorAgenda: color,
        });
        setCredencialesCreadas({ email, password: passwordTemporal });
        setNombre("");
        setEmail("");
        setTelefono("");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "No se pudo guardar el barbero.");
    } finally {
      setGuardando(false);
    }
  }

  if (credencialesCreadas) {
    return (
      <div className="card space-y-3">
        <p className="font-medium text-brand-900">Barbero creado ✓</p>
        <p className="text-sm text-brand-500">
          Pasale estos datos para que inicie sesión por primera vez:
        </p>
        <div className="bg-brand-50 rounded-md p-3 text-sm space-y-1">
          <p>
            <span className="text-brand-400">Email:</span>{" "}
            <span className="font-mono">{credencialesCreadas.email}</span>
          </p>
          <p>
            <span className="text-brand-400">Contraseña temporal:</span>{" "}
            <span className="font-mono">{credencialesCreadas.password}</span>
          </p>
        </div>
        <button
          onClick={() => setCredencialesCreadas(null)}
          className="btn-secondary w-full"
        >
          Agregar otro barbero
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={manejarSubmit} className="card space-y-4 h-fit">
      <p className="font-medium text-brand-900">
        {esEdicion ? "Editar barbero" : "Nuevo barbero"}
      </p>

      {error && (
        <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          Nombre completo
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-base"
          placeholder="Ej: Juan López"
        />
      </div>

      {!esEdicion && (
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
            placeholder="juan@ejemplo.com"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          Teléfono (opcional)
        </label>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="input-base"
          placeholder="+54 9 11 1234-5678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-2">
          Color en la agenda
        </label>
        <div className="flex gap-2">
          {COLORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "#1c1917" : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="btn-primary flex-1">
          {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear barbero"}
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
