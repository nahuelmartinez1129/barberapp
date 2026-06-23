"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const resultado = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCargando(false);

    if (resultado?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    // La redireccion segun rol se resuelve en /panel,
    // que lee la sesion y manda a cada uno a su vista correspondiente.
    router.push("/panel");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-brand-900">BarberApp</h1>
          <p className="text-sm text-brand-500 mt-1">Ingresá a tu cuenta</p>
        </div>

        <form onSubmit={manejarSubmit} className="card space-y-4">
          {error && (
            <div className="bg-danger-50 text-danger-700 text-sm px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={cargando} className="btn-primary w-full">
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-400 mt-6">
          ¿Tu barbería todavía no usa BarberApp?{" "}
          <a href="/contacto" className="text-accent-600 hover:underline">
            Conocé el sistema
          </a>
        </p>
      </div>
    </div>
  );
}
