import { EstadoSuscripcion, Suscripcion } from "@prisma/client";
import { formatearMoneda } from "@/lib/utils";
import { SuscripcionActionButton } from "./SuscripcionActionButton";
type Props = {
  suscripcion: Suscripcion;
};

export function ResumenSuscripcionCard({
  suscripcion,
}: Props) {
  const hoy = new Date();

  const diasRestantes = Math.max(
    0,
    Math.ceil(
      (suscripcion.fechaProximoPago.getTime() - hoy.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const progreso = Math.max(
    0,
    Math.min((diasRestantes / 30) * 100, 100)
  );

  const nombrePlan = {
    BASICO: "BarberApp Básico",
    PRO: "BarberApp Pro",
    PREMIUM: "BarberApp Premium",
  }[suscripcion.plan];

  const colorEstado =
    suscripcion.estado === EstadoSuscripcion.ACTIVA
      ? "bg-success-50 text-success-700"
      : suscripcion.estado === EstadoSuscripcion.PRUEBA
      ? "bg-accent-50 text-accent-700"
      : suscripcion.estado === EstadoSuscripcion.VENCIDA
      ? "bg-warning-50 text-warning-700"
      : "bg-danger-50 text-danger-700";

  const textoEstado =
    suscripcion.estado === EstadoSuscripcion.PRUEBA
      ? "Prueba gratuita"
      : suscripcion.estado === EstadoSuscripcion.ACTIVA
      ? "Suscripción activa"
      : suscripcion.estado === EstadoSuscripcion.VENCIDA
      ? "Pago pendiente"
      : "Suscripción cancelada";

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-sm">

      <div className="flex items-start justify-between gap-6">

        <div>

          <p className="text-sm text-brand-500">
            Tu suscripción
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-brand-900">
            {textoEstado}
          </h2>

        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${colorEstado}`}
        >
          {textoEstado}
        </span>

      </div>

      {suscripcion.estado === EstadoSuscripcion.PRUEBA && (
        <>
          <p className="mt-8 text-brand-500">
            Te quedan
          </p>

          <p className="text-6xl font-bold text-brand-900 leading-none">
            {diasRestantes}
          </p>

          <p className="mt-2 text-brand-500">
            días para utilizar todas las funciones de BarberApp.
          </p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full bg-success-500 transition-all duration-500"
              style={{
                width: `${progreso}%`,
              }}
            />
          </div>
        </>
      )}

      <div className="my-10 border-t border-brand-100" />

      <div className="grid gap-8 md:grid-cols-3">

        <div>

          <p className="text-sm text-brand-500">
            Próximo plan
          </p>

          <p className="mt-2 text-2xl font-semibold text-brand-900">
            {nombrePlan}
          </p>

        </div>

        <div>

          <p className="text-sm text-brand-500">
            Precio mensual
          </p>

          <p className="mt-2 text-2xl font-semibold text-brand-900">
            {formatearMoneda(Number(suscripcion.precioMensual))}
          </p>

        </div>

        <div>

          <p className="text-sm text-brand-500">
            Próximo cobro
          </p>

          <p className="mt-2 text-2xl font-semibold text-brand-900">
            {suscripcion.fechaProximoPago.toLocaleDateString("es-AR")}
          </p>

        </div>

      </div>

    <div className="mt-10">

  <SuscripcionActionButton
    estado={suscripcion.estado}
      barberiaId={suscripcion.barberiaId}
  />

  <p className="mt-3 text-center text-sm text-brand-400">

    {suscripcion.estado === EstadoSuscripcion.PRUEBA &&
      "Cuando finalice tu prueba podrás continuar utilizando BarberApp mediante Mercado Pago."}

    {suscripcion.estado === EstadoSuscripcion.ACTIVA &&
      "Tu suscripción está activa y funcionando correctamente."}

    {suscripcion.estado === EstadoSuscripcion.CANCELADA &&
      "Podés volver a activar tu suscripción cuando quieras."}

    {suscripcion.estado === EstadoSuscripcion.VENCIDA &&
      "Actualizá tu método de pago para seguir utilizando BarberApp."}

  </p>

</div>

    </div>
  );
}