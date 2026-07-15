"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatearMoneda, iniciales } from "@/lib/utils";
import { BadgeClasificacion } from "@/components/BadgeClasificacion";
import type { ClienteConMetricas } from "@/lib/clientes";

function formatearFechaCorta(fecha: Date | null): string {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

export function TablaClientes({
  slug,
  clientes,
}: {
  slug: string;
  clientes: ClienteConMetricas[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    const lista = !termino
      ? clientes
      : clientes.filter((c) => {
          return (
            c.nombre.toLowerCase().includes(termino) ||
            (c.email ?? "").toLowerCase().includes(termino) ||
            (c.telefono ?? "").toLowerCase().includes(termino)
          );
        });

    // Orden por defecto: mas visitas -> mas gasto -> ultima visita mas reciente
    return [...lista].sort((a, b) => {
      if (b.visitas !== a.visitas) return b.visitas - a.visitas;
      if (b.totalGastado !== a.totalGastado) return b.totalGastado - a.totalGastado;
      const fechaA = a.ultimaVisita ? a.ultimaVisita.getTime() : 0;
      const fechaB = b.ultimaVisita ? b.ultimaVisita.getTime() : 0;
      return fechaB - fechaA;
    });
  }, [clientes, busqueda]);

  return (
    <div>
      <div className="mb-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="input-base max-w-sm"
        />
      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-brand-400">
          {clientes.length === 0
            ? "Todavía no hay clientes con turnos registrados."
            : "Ningún cliente coincide con la búsqueda."}
        </p>
      )}

      {filtrados.length > 0 && (
        <>
          {/* Tabla en pantallas medianas/grandes */}
          <div className="hidden md:block bg-white border border-brand-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-brand-400">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium text-right">Visitas</th>
                  <th className="px-4 py-3 font-medium text-right">Total gastado</th>
                  <th className="px-4 py-3 font-medium">Última visita</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr
                    key={c.clienteId}
                    className="border-b border-brand-50 last:border-0 hover:bg-brand-50/60 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${slug}/clientes/${c.clienteId}`}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-medium text-brand-600 shrink-0">
                          {iniciales(c.nombre)}
                        </div>
                        <span className="text-brand-900 font-medium">{c.nombre}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-500">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-brand-500">{c.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-brand-900">{c.visitas}</td>
                    <td className="px-4 py-3 text-right text-brand-900">
                      {formatearMoneda(c.totalGastado)}
                    </td>
                    <td className="px-4 py-3 text-brand-500">
                      {formatearFechaCorta(c.ultimaVisita)}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeClasificacion clasificacion={c.clasificacion} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en mobile */}
          <div className="md:hidden space-y-2">
            {filtrados.map((c) => (
              <Link
                key={c.clienteId}
                href={`/admin/${slug}/clientes/${c.clienteId}`}
                className="card block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-600 shrink-0">
                    {iniciales(c.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-900 truncate">{c.nombre}</p>
                    <p className="text-xs text-brand-400 truncate">
                      {c.email ?? c.telefono ?? "—"}
                    </p>
                  </div>
                  <BadgeClasificacion clasificacion={c.clasificacion} />
                </div>
                <div className="flex justify-between text-xs text-brand-500">
                  <span>{c.visitas} visitas</span>
                  <span>{formatearMoneda(c.totalGastado)}</span>
                  <span>{formatearFechaCorta(c.ultimaVisita)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
