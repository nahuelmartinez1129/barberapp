"use server";

import { prisma } from "@/lib/prisma";
import { crearSuscripcionMercadoPago } from "@/lib/mercadopago/suscripciones";
import { requireSession } from "@/lib/auth/requireSession";
import { requireBarberiaDelDueno } from "@/lib/actions/guards/requireBarberiaDelDueno";

export async function iniciarSuscripcionMercadoPago(
  barberiaId: string
) {
  console.log(
    "ENTRANDO A iniciarSuscripcionMercadoPago"
  );
  const session = await requireSession();

  await requireBarberiaDelDueno({
    usuarioId: session.user.id,
    barberiaId,
  });

  const barberia = await prisma.barberia.findUnique({
    where: {
      id: barberiaId,
    },
    include: {
      suscripcion: true,
      miembros: {
        where: {
          rol: "DUENO",
          activo: true,
        },
        include: {
          usuario: true,
        },
      },
    },
  });

  if (!barberia) {
    throw new Error("Barbería no encontrada.");
  }

  if (!barberia.suscripcion) {
    throw new Error("La barbería no tiene una suscripción.");
  }

  const dueno = barberia.miembros[0];

  if (!dueno) {
    throw new Error("No existe un dueño para esta barbería.");
  }

  if (
    barberia.suscripcion.estado !== "CANCELADA" &&
    barberia.suscripcion.mercadopagoSubId &&
    barberia.suscripcion.checkoutUrl
) {
  return {
    id: barberia.suscripcion.mercadopagoSubId,
    initPoint: barberia.suscripcion.checkoutUrl,
    status: barberia.suscripcion.estado,
  };
}

  return crearSuscripcionMercadoPago({
    barberiaId: barberia.id,
    email: dueno.usuario.email, // dueno.usuario.email,
    plan: barberia.suscripcion.plan,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/${barberia.slug}/suscripcion`,
    backUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/${barberia.slug}/suscripcion`,
  });
}

// Si ya existe una suscripción creada en Mercado Pago,
// reutilizamos el checkout existente para evitar crear
// múltiples preapprovals para la misma barbería.