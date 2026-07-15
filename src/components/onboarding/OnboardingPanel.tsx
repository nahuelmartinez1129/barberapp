import { User, Scissors, Clock3, Share2 } from "lucide-react";

import { OnboardingCard } from "./OnboardingCard";
import { ONBOARDING } from "@/lib/onboarding";

type Props = {
  slug: string;

  cantidadBarberos: number;
  cantidadServicios: number;
  horariosConfigurados: boolean;
};

export function OnboardingPanel({
  slug,
  cantidadBarberos,
  cantidadServicios,
  horariosConfigurados,
}: Props) {
  const pasosTotales = 3;

  const pasosCompletados = [
    cantidadBarberos > 0,
    cantidadServicios > 0,
    horariosConfigurados,
    false,
  ].filter(Boolean).length;

  return (
    <section className="mb-10 rounded-2xl border border-brand-100 bg-brand-50 p-8">

      <h2 className="text-3xl font-semibold text-brand-900">
        Bienvenido a BarberApp
      </h2>

      <p className="mt-3 text-brand-500 max-w-2xl">
        Tu prueba gratuita ya está activa.
        Vamos a ayudarte a dejar la barbería lista para comenzar
        a recibir reservas online.
      </p>

      <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-700 border border-brand-100">
        {pasosCompletados} de {pasosTotales} pasos completados
      </div>

      <div className="mt-8 space-y-5">

        <OnboardingCard
          icono={<User size={22} />}
          titulo={ONBOARDING.BARBERO.titulo}
          descripcion={ONBOARDING.BARBERO.descripcion}
          boton={ONBOARDING.BARBERO.boton}
          href={`/admin/${slug}/barberos`}
          completado={cantidadBarberos > 0}
        />

        <OnboardingCard
          icono={<Scissors size={22} />}
          titulo={ONBOARDING.SERVICIO.titulo}
          descripcion={ONBOARDING.SERVICIO.descripcion}
          boton={ONBOARDING.SERVICIO.boton}
          href={`/admin/${slug}/servicios`}
          completado={cantidadServicios > 0}
        />

        <OnboardingCard
         icono={<Clock3 size={22} />}
        titulo={ONBOARDING.HORARIOS.titulo}
        descripcion={ONBOARDING.HORARIOS.descripcion}
        boton={ONBOARDING.HORARIOS.boton}
        href={`/admin/${slug}/configuracion`}
        completado={horariosConfigurados}
        />

     

      </div>
    </section>
  );
}