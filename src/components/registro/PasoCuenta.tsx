"use client";

import { RegistroBarberiaData } from "@/types/registro";

export function PasoCuenta({
    datos,
    setDatos,
    onContinuar,
}:{
    datos: RegistroBarberiaData;

    setDatos: React.Dispatch<
        React.SetStateAction<RegistroBarberiaData>
    >;

    onContinuar:()=>void;
}) {
  return (
    <div className="card p-8">

      <h1 className="text-3xl font-semibold text-brand-900">
        Empecemos por vos
      </h1>

      <p className="mt-2 text-brand-500">
        Necesitamos algunos datos para crear tu cuenta.
      </p>

      <div className="mt-8 space-y-4">

        <input
  value={datos.nombre}
  onChange={(e) =>
    setDatos((prev) => ({
      ...prev,
      nombre: e.target.value,
    }))
  }
  placeholder="Nombre"
  className="input-base"
/>

      <input
  value={datos.apellido}
  onChange={(e) =>
    setDatos((prev) => ({
      ...prev,
      apellido: e.target.value,
    }))
  }
  placeholder="Apellido"
  className="input-base"
/>

       <input
  type="email"
  value={datos.email}
  onChange={(e) =>
    setDatos((prev) => ({
      ...prev,
      email: e.target.value,
    }))
  }
  placeholder="Correo electrónico"
  className="input-base"
/>
<input
  type="password"
  value={datos.password}
  onChange={(e) =>
    setDatos((prev) => ({
      ...prev,
      password: e.target.value,
    }))
  }
  placeholder="Contraseña"
  className="input-base"
/>

      </div>

      <button
        onClick={onContinuar}
        className="btn-primary mt-8 w-full"
      >
        Continuar
      </button>

    </div>
  );

}
<div className="mt-6 text-center text-sm text-brand-500">

  ¿Ya tenés una cuenta?

  <a
    href="/login"
    className="ml-1 text-accent-600 hover:underline"
  >
    Iniciar sesión
  </a>

</div>