"use client";

import { useRouter } from "next/navigation";
import { EstadoSuscripcion } from "@prisma/client";

import {
  cancelarSuscripcion,
  reactivarSuscripcion,
} from "@/lib/actions/suscripcion";

import { iniciarSuscripcionMercadoPago } from "@/lib/actions/mercadopago";

type Props = {
  estado: EstadoSuscripcion;
  barberiaId: string;
};

export function SuscripcionActionButton({
  estado,
  barberiaId,
}: Props) {
  const router = useRouter();

async function activar() {
  try {
    console.log("CLICK EN ACTIVAR");
    const respuesta = await iniciarSuscripcionMercadoPago(barberiaId);

    if (!respuesta?.initPoint) {
      throw new Error("Mercado Pago no devolvió la URL del checkout.");
    }

    window.location.href = respuesta.initPoint;

  } catch (error) {
    console.error(error);
  }
}

  async function cancelar() {
    await cancelarSuscripcion(barberiaId);
    router.refresh();
  }

  async function reactivar() {
    await reactivarSuscripcion(barberiaId);
    router.refresh();
  }

  switch (estado) {
    case EstadoSuscripcion.PRUEBA:
      return (
        <button
          onClick={activar}
          className="btn-primary w-full"
        >
          Continuar con BarberApp
        </button>
      );

    case EstadoSuscripcion.ACTIVA:
      return (
        <button
          onClick={cancelar}
          className="btn-secondary w-full"
        >
          Cancelar suscripción
        </button>
      );

    case EstadoSuscripcion.CANCELADA:
      return (
        <button
          onClick={reactivar}
          className="btn-primary w-full"
        >
          Volver a suscribirme
        </button>
      );

   case EstadoSuscripcion.VENCIDA:
  return (
   <div className="flex justify-center">
      <button
        onClick={activar}
        className="
          bg-black
          text-white
          px-10
          py-3
          rounded-xl
          font-medium
          hover:opacity-90
          transition
          min-w-[380px]
        "
      >
        Actualizar método de pago
      </button>
    </div>
  );
    default:
      return null;
  }
}