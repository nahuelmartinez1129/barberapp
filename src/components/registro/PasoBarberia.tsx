"use client";

import { RegistroBarberiaData } from "@/types/registro";

function generarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function PasoBarberia({
  datos,
  setDatos,
  onFinalizar,
  cargando,
}: {
  datos: RegistroBarberiaData;
  setDatos: React.Dispatch<
    React.SetStateAction<RegistroBarberiaData>
  >;
  onFinalizar: () => void;
  cargando: boolean;
}) {
  return (
    <div className="card p-8">
      <div className="mb-5">
        <span className="inline-flex rounded-full bg-success-50 px-3 py-1 text-sm text-success-700">
          30 días gratis
        </span>
      </div>

      <h1 className="text-3xl font-semibold text-brand-900">
        Ahora contanos sobre tu barbería.
      </h1>

      <p className="mt-2 text-brand-500">
        Con esta información vamos a crear tu página de reservas.
      </p>

      <div className="mt-8 space-y-5">
        {/* Nombre */}
        <div>
          <label className="text-sm text-brand-500">
            Nombre de la barbería
          </label>

          <input
            value={datos.barberia}
            onChange={(e) => {
              const nombre = e.target.value;

              setDatos((prev) => ({
                ...prev,
                barberia: nombre,
                slug: generarSlug(nombre),
              }));
            }}
            placeholder="Ej. El Zorro"
            className="input-base mt-2"
          />
        </div>

        {/* URL */}
        <div className="rounded-lg bg-brand-50 border border-brand-100 p-4">
          <p className="text-xs text-brand-400">
            Tu página pública será
          </p>

          <p className="mt-1 font-medium text-brand-900 break-all">
            /reservar/{datos.slug || "tu-barberia"}
          </p>
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-sm text-brand-500">
            Teléfono
          </label>

          <input
            value={datos.telefono}
            onChange={(e) =>
              setDatos((prev) => ({
                ...prev,
                telefono: e.target.value,
              }))
            }
            className="input-base mt-2"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="text-sm text-brand-500">
            Dirección
          </label>

          <input
            value={datos.direccion}
            onChange={(e) =>
              setDatos((prev) => ({
                ...prev,
                direccion: e.target.value,
              }))
            }
            className="input-base mt-2"
          />
        </div>
      </div>

      <button
  onClick={onFinalizar}
  disabled={cargando}
  className="btn-primary mt-8 w-full disabled:opacity-50"
>
  {cargando
      ? "Creando tu barbería..."
      : "Comenzar prueba gratuita"}
</button>
    </div>
  );
}