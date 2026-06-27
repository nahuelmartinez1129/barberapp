"use client";

import { useEffect } from "react";

export function ModalBase({
  titulo,
  onCerrar,
  children,
  maxWidth = "max-w-md",
}: {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  // Cerrar con Escape, comportamiento estandar de modal
  useEffect(() => {
    function manejarEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", manejarEscape);
    return () => document.removeEventListener("keydown", manejarEscape);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        className={`relative bg-white border border-brand-100 rounded-lg shadow-lg w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100 sticky top-0 bg-white">
          <p className="font-medium text-brand-900">{titulo}</p>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-brand-400 hover:text-brand-700 p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
