import Link from "next/link";

type Props = {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  completado: boolean;
  boton?: string;
  href?: string;
};

export function OnboardingCard({
  icono,
  titulo,
  descripcion,
  completado,
  boton,
  href,
}: Props) {
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-6">

      <div className="flex gap-4">

        <div className="mt-1 text-accent-600">
          {icono}
        </div>

        <div className="flex-1">

          <h3 className="text-lg font-medium text-brand-900">

            {completado
              ? `✓ ${titulo}`
              : titulo}

          </h3>

          <p className="mt-2 text-sm text-brand-500">

            {descripcion}

          </p>

          {!completado && href && boton && (

            <Link
              href={href}
              className="btn-primary mt-5 inline-flex"
            >
              {boton}
            </Link>

          )}

        </div>

      </div>

    </div>
  );
}