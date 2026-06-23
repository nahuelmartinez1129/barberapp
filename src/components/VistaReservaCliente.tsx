"use client";

import { useState } from "react";
import { MisTurnos } from "@/components/MisTurnos";

type Turno = {
  id: string;
  fecha: string;
  horaInicio: string;
  estado: string;
  precioCobrado: string;
  servicioNombre: string;
  barberoNombre: string;
};

export function VistaReservaCliente({
  haySesion,
  turnosCliente,
  wizard,
}: {
  haySesion: boolean;
  turnosCliente: Turno[];
  wizard: React.ReactNode;
}) {
  const [pestana, setPestana] = useState<"reservar" | "mis-turnos">("reservar");

  if (!haySesion) {
    // Visitante sin loguear: solo puede mirar el wizard (le va a pedir login al confirmar)
    return <>{wizard}</>;
  }

  return (
    <div>
      <div className="max-w-md mx-auto mb-4 flex gap-2">
        <button
          onClick={() => setPestana("reservar")}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pestana === "reservar"
              ? "bg-brand-900 text-white"
              : "bg-white text-brand-600 border border-brand-200"
          }`}
        >
          Reservar turno
        </button>
        <button
          onClick={() => setPestana("mis-turnos")}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pestana === "mis-turnos"
              ? "bg-brand-900 text-white"
              : "bg-white text-brand-600 border border-brand-200"
          }`}
        >
          Mis turnos
        </button>
      </div>

      {pestana === "reservar" ? wizard : <MisTurnos turnos={turnosCliente} />}
    </div>
  );
}
