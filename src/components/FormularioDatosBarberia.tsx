"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarDatosBarberia,
  subirLogoBarberia,
} from "@/lib/actions/configuracion";

import { ZONAS_HORARIAS_SOPORTADAS } from "@/lib/zonas-horarias";

type Barberia = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  zonaHoraria: string;
  logoUrl: string | null;
};

const ETIQUETAS_ZONA: Record<string, string> = {
  "America/Argentina/Buenos_Aires": "Argentina (Buenos Aires)",
  "America/Santiago": "Chile (Santiago)",
  "America/Montevideo": "Uruguay (Montevideo)",
  "America/Asuncion": "Paraguay (Asunción)",
  "America/Lima": "Perú (Lima)",
  "America/Bogota": "Colombia (Bogotá)",
  "America/Mexico_City": "México (Ciudad de México)",
};

export function FormularioDatosBarberia({ barberia }: { barberia: Barberia }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState(barberia.nombre);
  const [telefono, setTelefono] = useState(barberia.telefono ?? "");
  const [direccion, setDireccion] = useState(barberia.direccion ?? "");
  const [zonaHoraria, setZonaHoraria] = useState(
    barberia.zonaHoraria || "America/Argentina/Buenos_Aires"
  );

  const [previewLogo, setPreviewLogo] = useState<string | null>(barberia.logoUrl);
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(
    null
  );

  function manejarSeleccionLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "La imagen es demasiado grande. Máximo 5MB." });
      return;
    }

    setArchivoLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
    setMensaje(null);
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim()) {
      setMensaje({ tipo: "error", texto: "El nombre de la barbería es obligatorio." });
      return;
    }

    setGuardando(true);
    try {
      await actualizarDatosBarberia({
        barberiaId: barberia.id,
        nombre,
        telefono: telefono || undefined,
        direccion: direccion || undefined,
        zonaHoraria,
      });

      if (archivoLogo) {
        const formData = new FormData();
        formData.set("logo", archivoLogo);
        await subirLogoBarberia(barberia.id, formData);
        setArchivoLogo(null);
      }

      setMensaje({ tipo: "exito", texto: "Cambios guardados correctamente." });
      router.refresh();
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message ?? "No se pudieron guardar los cambios. Intentá de nuevo.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="card space-y-5">
      <p className="font-medium text-brand-900">Datos de la barbería</p>

      {mensaje && (
        <div
          className={`text-sm px-3 py-2 rounded-md ${
            mensaje.tipo === "exito"
              ? "bg-success-50 text-success-700"
              : "bg-danger-50 text-danger-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-2">Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center overflow-hidden shrink-0">
            {previewLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-brand-400">Sin logo</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={manejarSeleccionLogo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
            >
              {previewLogo ? "Cambiar logo" : "Subir logo"}
            </button>
            <p className="text-xs text-brand-400 mt-1.5">JPG, PNG o WEBP. Máximo 5MB.</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">
          Nombre de la barbería
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">Teléfono</label>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="input-base"
            placeholder="+54 9 11 1234-5678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">Dirección</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="input-base"
            placeholder="Av. Siempre Viva 742"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1.5">Zona horaria</label>
        <select
          value={zonaHoraria}
          onChange={(e) => setZonaHoraria(e.target.value)}
          className="input-base"
        >
          {ZONAS_HORARIAS_SOPORTADAS.map((zona) => (
            <option key={zona} value={zona}>
              {ETIQUETAS_ZONA[zona] ?? zona}
            </option>
          ))}
        </select>
        <p className="text-xs text-brand-400 mt-1.5">
          Se usa para calcular correctamente los horarios disponibles de reserva.
        </p>
      </div>

      <button type="submit" disabled={guardando} className="btn-primary">
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
