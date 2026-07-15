import Link from "next/link";
import type { EstadoAcceso } from "@/types/estado-acceso";

export function AvisoSuscripcion({
  estadoAcceso,
  slug,
}: {
  estadoAcceso: EstadoAcceso;
  slug: string;
}) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="card">
        <h2 className="text-lg font-medium text-brand-900 mb-2">
          Acceso suspendido
        </h2>
        <p className="text-sm text-brand-500 mb-5">{estadoAcceso.mensaje}</p>
        <Link href={`/admin/${slug}/suscripcion`} className="btn-primary inline-block">
          Ver planes y reactivar
        </Link>
      </div>
    </div>
  );
}
