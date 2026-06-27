"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { EstadoAcceso } from "@/lib/suscripcion";

const ITEMS = [
  { href: "", label: "Resumen" },
  { href: "/turnos", label: "Turnos" },
  { href: "/barberos", label: "Barberos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/clientes", label: "Clientes" },
  { href: "/configuracion", label: "Configuración" },
];

export function SidebarAdmin({
  slug,
  nombreBarberia,
  estadoAcceso,
  logoUrl,
}: {
  slug: string;
  nombreBarberia: string;
  estadoAcceso: EstadoAcceso;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const base = `/admin/${slug}`;
  const [abierto, setAbierto] = useState(false);

  const colorEstado =
    estadoAcceso.estado === "ACTIVA"
      ? "bg-success-50 text-success-700"
      : estadoAcceso.estado === "PRUEBA"
      ? "bg-accent-50 text-accent-700"
      : "bg-warning-50 text-warning-700";

  const etiquetaEstado =
    (estadoAcceso.estado === "ACTIVA" && "Suscripción activa") ||
    (estadoAcceso.estado === "PRUEBA" && `Prueba: ${estadoAcceso.diasRestantes}d restantes`) ||
    (estadoAcceso.estado === "VENCIDA" && "Pago atrasado") ||
    (estadoAcceso.estado === "CANCELADA" && "Suscripción cancelada") ||
    "";

  return (
    <>
      {/* Barra superior, solo visible en mobile/tablet. No es 'fixed' para no superponerse;
          ocupa su propio lugar arriba del contenido y luego el <main> sigue debajo. */}
      <div className="lg:hidden w-full bg-white border-b border-brand-100 px-4 py-3 flex items-center justify-between">
        <p className="font-medium text-brand-900 truncate text-sm">{nombreBarberia}</p>
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="p-2 -mr-2 text-brand-700 shrink-0"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Overlay mobile, solo cuando el drawer esta abierto */}
      {abierto && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Drawer en mobile (fixed, fuera del flujo) / columna fija en desktop */}
      <aside
        className={cn(
          "bg-white border-r border-brand-100 flex flex-col w-64 shrink-0",
          "fixed top-0 left-0 h-screen z-50 transition-transform duration-200",
          "lg:sticky lg:translate-x-0",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-4 py-5 border-b border-brand-100 flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2.5">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={nombreBarberia}
                className="w-9 h-9 rounded-full object-cover border border-brand-100 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium text-brand-900 truncate">{nombreBarberia}</p>
              <p className="text-xs text-brand-400">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
            className="lg:hidden p-1 text-brand-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {ITEMS.map((item) => {
            const href = `${base}${item.href}`;
            const activo = pathname === href;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setAbierto(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  activo
                    ? "bg-brand-100 text-brand-900 font-medium"
                    : "text-brand-500 hover:bg-brand-50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          <Link
            href={`${base}/suscripcion`}
            onClick={() => setAbierto(false)}
            className={cn("block px-3 py-2 rounded-md text-xs font-medium", colorEstado)}
          >
            {etiquetaEstado}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-brand-400 hover:bg-brand-50"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
