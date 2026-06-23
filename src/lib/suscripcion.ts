import { prisma } from "@/lib/prisma";

export type EstadoAcceso = {
  tieneAcceso: boolean;
  estado: "ACTIVA" | "VENCIDA" | "CANCELADA" | "PRUEBA" | "SIN_SUSCRIPCION";
  diasRestantes: number | null;
  mensaje: string | null;
};

const DIAS_GRACIA_VENCIMIENTO = 3; // dias de tolerancia despues del vencimiento antes de bloquear

/**
 * Determina si una barberia tiene acceso al sistema segun su suscripcion.
 * Se llama en el middleware/layout del dashboard admin y barbero.
 * La pagina publica de reservas (/reservar/[slug]) tambien deberia consultar
 * esto para mostrar un aviso de "temporalmente no disponible" si esta vencida.
 */
export async function verificarAccesoBarberia(
  barberiaId: string
): Promise<EstadoAcceso> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { barberiaId },
  });

  if (!suscripcion) {
    return {
      tieneAcceso: false,
      estado: "SIN_SUSCRIPCION",
      diasRestantes: null,
      mensaje: "Esta barbería no tiene una suscripción configurada.",
    };
  }

  const hoy = new Date();
  const msPorDia = 1000 * 60 * 60 * 24;
  const diasRestantes = Math.ceil(
    (suscripcion.fechaProximoPago.getTime() - hoy.getTime()) / msPorDia
  );

  if (suscripcion.estado === "CANCELADA") {
    return {
      tieneAcceso: false,
      estado: "CANCELADA",
      diasRestantes,
      mensaje: "La suscripción fue cancelada. Reactivala para seguir usando el sistema.",
    };
  }

  if (suscripcion.estado === "PRUEBA") {
    return {
      tieneAcceso: diasRestantes >= 0,
      estado: "PRUEBA",
      diasRestantes,
      mensaje:
        diasRestantes >= 0
          ? `Período de prueba: te quedan ${diasRestantes} días.`
          : "Tu período de prueba terminó. Activá un plan para continuar.",
    };
  }

  // estado ACTIVA o VENCIDA segun fechaProximoPago, con dias de gracia
  if (diasRestantes >= 0) {
    return {
      tieneAcceso: true,
      estado: "ACTIVA",
      diasRestantes,
      mensaje: null,
    };
  }

  const diasVencido = Math.abs(diasRestantes);
  if (diasVencido <= DIAS_GRACIA_VENCIMIENTO) {
    return {
      tieneAcceso: true,
      estado: "VENCIDA",
      diasRestantes,
      mensaje: `Tu pago está atrasado. Tenés ${DIAS_GRACIA_VENCIMIENTO - diasVencido} días antes de que se suspenda el acceso.`,
    };
  }

  return {
    tieneAcceso: false,
    estado: "VENCIDA",
    diasRestantes,
    mensaje: "El acceso fue suspendido por falta de pago. Renová tu suscripción para reactivarlo.",
  };
}
