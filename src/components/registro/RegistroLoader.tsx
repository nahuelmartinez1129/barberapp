"use client";

type Props = {
  paso: string;
};

export function RegistroLoader({
  paso,
}: Props) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">

      <div className="w-full max-w-md">

        <div className="card p-10 text-center">

          <div className="mx-auto mb-8 h-16 w-16 rounded-2xl bg-accent-500" />

          <h2 className="text-3xl font-semibold text-brand-900">

            Estamos preparando tu barbería

          </h2>

          <p className="mt-3 text-brand-500">

            Esto tarda sólo unos segundos.

          </p>

          <div className="mt-10 h-2 overflow-hidden rounded-full bg-brand-100">

            <div className="h-full w-2/3 bg-accent-500 animate-pulse" />

          </div>

          <p className="mt-6 text-sm text-brand-500">

            {paso}

          </p>

        </div>

      </div>

    </div>
  );
}