import { AvisoSuscripcion } from "@/components/AvisoSuscripcion";
import type { ResultadoAcceso } from "@/lib/actions/verificarAcceso";
import type { EstadoAcceso } from "@/types/estado-acceso";

type Props = {
  acceso: ResultadoAcceso;
  slug: string;
};

export function ProteccionSuscripcion({
  acceso,
  slug,
}: Props) {
  if (acceso.permitida) {
    return null;
  }

  const estadoAcceso: EstadoAcceso = {
    tieneAcceso: false,

    estado:
      acceso.suscripcion?.estado ??
      "SIN_SUSCRIPCION",

    diasRestantes:
      acceso.suscripcion
        ? Math.max(
            0,
            Math.ceil(
              (acceso.suscripcion.fechaProximoPago.getTime() -
                Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : null,

    mensaje: acceso.mensaje,
  };

  return (
    <AvisoSuscripcion
      estadoAcceso={estadoAcceso}
      slug={slug}
    />
  );
}