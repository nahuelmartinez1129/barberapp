import { CheckCircle2 } from "lucide-react";
import { Suscripcion } from "@prisma/client";
import { PLANES } from "../../lib/plans";

type Props = {
  suscripcion: Suscripcion;
};

export function PlanBarberAppCard({
  suscripcion,
}: Props) {
  const plan = PLANES[suscripcion.plan];

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-sm">

      <div className="max-w-2xl">

        <p className="text-sm text-brand-500">
          Todo lo que incluye {plan.nombre}
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-brand-900">
          Un sistema pensado para hacer crecer tu barbería
        </h2>

        <p className="mt-3 text-brand-500">
          {plan.descripcion}
        </p>

      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">

        {plan.beneficios.map((beneficio) => (
          <div
            key={beneficio}
            className="flex items-start gap-3 rounded-xl border border-brand-100 p-4"
          >
            <CheckCircle2
              size={22}
              className="mt-0.5 text-success-600 shrink-0"
            />

            <p className="text-brand-700">
              {beneficio}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}