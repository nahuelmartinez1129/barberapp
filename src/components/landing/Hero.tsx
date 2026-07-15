import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-brand-50">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 py-20 lg:flex-row">

        {/* Texto */}
        <div className="flex-1">

          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-brand-900">
            La forma más simple de administrar tu barbería.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-brand-500">
            Gestioná turnos, clientes, servicios y barberos desde un solo lugar.
            Tus clientes reservan online mientras vos te enfocás en atender.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href="/registro"
              className="btn-primary flex items-center gap-2"
            >
              Empezar prueba gratuita
              <ArrowRight size={18} />
            </Link>

            <a
              href="#funciones"
              className="btn-secondary flex items-center gap-2"
            >
              <Play size={18} />
              Ver cómo funciona
            </a>

          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-brand-500 sm:flex-row sm:gap-6">

            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              30 días gratis
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              Sin tarjeta de crédito
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              Cancelá cuando quieras
            </div>

          </div>

        </div>

        {/* Mockup */}

        <div className="flex flex-1 justify-center">

          <div className="w-full max-w-xl rounded-2xl border border-brand-200 bg-white shadow-xl">

            <div className="border-b border-brand-100 px-6 py-4">

              <div className="h-5 w-48 rounded bg-brand-100" />

            </div>

            <div className="space-y-5 p-6">

              <div className="h-28 rounded-xl bg-brand-50" />

              <div className="grid grid-cols-2 gap-4">

                <div className="h-24 rounded-xl bg-brand-50" />

                <div className="h-24 rounded-xl bg-brand-50" />

              </div>

              <div className="h-40 rounded-xl bg-brand-50" />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}