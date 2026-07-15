"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-xl font-semibold text-brand-900"
        >
          BarberApp
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#funciones"
            className="text-sm text-brand-500 hover:text-brand-900"
          >
            Funciones
          </a>

          <a
            href="#precios"
            className="text-sm text-brand-500 hover:text-brand-900"
          >
            Precios
          </a>

          <a
            href="#faq"
            className="text-sm text-brand-500 hover:text-brand-900"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="text-sm text-brand-500 hover:text-brand-900"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/registro"
            className="btn-primary"
          >
            Empezar gratis
          </Link>

        </div>

      </div>
    </header>
  );
}