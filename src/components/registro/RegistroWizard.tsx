"use client";

import { useState } from "react";
import { PasoCuenta } from "./PasoCuenta";
import { PasoBarberia } from "./PasoBarberia";
import { RegistroBarberiaData } from "@/types/registro";
import { registrarBarberia } from "@/lib/actions/registro";
import { signIn } from "next-auth/react";
import { RegistroLoader } from "./RegistroLoader";
import { validarRegistro } from "@/lib/actions/validarRegistro";

export function RegistroWizard() {
  const [paso, setPaso] = useState(1);

 
const [pasoCarga, setPasoCarga] = useState("");
const [cargando, setCargando] = useState(false);

const [error, setError] = useState("");

  const [datos, setDatos] = useState<RegistroBarberiaData>({
    nombre: "",
    apellido: "",

    email: "",
    password: "",

    barberia: "",
    slug: "",

    telefono: "",
    direccion: "",
  });

  
async function handleContinuar() {
  try {
    setError("");

    await validarRegistro({
  email: datos.email,
});

    setPaso(2);
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Ocurrió un error.");
    }
  }
}

 async function handleRegistro() {
  try {
    setCargando(true);
    setPasoCarga("Creando tu cuenta...");
    setError("");

    await validarRegistro({
  email: datos.email,
  slug: datos.slug,
});

    await registrarBarberia(datos);

    

    setPasoCarga("Ingresando al panel...");
    await signIn("credentials", {
      email: datos.email,
      password: datos.password,
      redirect: true,
      callbackUrl: `/admin/${datos.slug}`,
    });

  } catch (err) {

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Ocurrió un error inesperado.");
    }

    setCargando(false);
  }
}
if (cargando) {
  return (
    <RegistroLoader
      paso={pasoCarga}
    />
  );
}
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-brand-400 mb-2">
          <span>Paso {paso} de 2</span>
        </div>

        <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
          <div
            className={`h-full bg-accent-500 transition-all duration-300 ${
              paso === 1 ? "w-1/2" : "w-full"
            }`}
          />
        </div>
      </div>

        {error && (
  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {error}
  </div>
)}
      {paso === 1 && (
        <PasoCuenta
  datos={datos}
  setDatos={setDatos}
  onContinuar={handleContinuar}
/>
      )}

      {paso === 2 && (
        <PasoBarberia
          datos={datos}
          setDatos={setDatos}
          onFinalizar={handleRegistro}
          cargando={cargando}
        />
      )}
    </div>
  );
}