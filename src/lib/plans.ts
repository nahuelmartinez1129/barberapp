import { PlanSuscripcion } from "@prisma/client";

export const PLANES = {
  [PlanSuscripcion.BASICO]: {
    id: PlanSuscripcion.BASICO,

    nombre: "BarberApp Básico",

    descripcion:
      "Todo lo necesario para administrar una barbería.",

    precio: 100,

    moneda: "ARS",

    frecuencia: 1,

    frecuenciaTipo: "months",

    pruebaDias: 30,

    mercadopagoPlanId:
      process.env.MP_PLAN_BASICO_ID ?? null,

    beneficios: [
      "Agenda online disponible las 24 horas",
      "Turnos ilimitados",
      "Clientes ilimitados",
      "Barberos ilimitados",
      "Página pública de reservas",
      "Código QR personalizado",
      "Estadísticas del negocio",
      "Soporte y actualizaciones",
    ],
  },

  [PlanSuscripcion.PRO]: {
    id: PlanSuscripcion.PRO,

    nombre: "BarberApp Pro",

    descripcion:
      "Para barberías con mayor volumen de trabajo.",

    precio: 35000,

    moneda: "ARS",

    frecuencia: 1,

    frecuenciaTipo: "months",

    pruebaDias: 30,

    mercadopagoPlanId:
      process.env.MP_PLAN_PRO_ID ?? null,

    beneficios: [],
  },

  [PlanSuscripcion.PREMIUM]: {
    id: PlanSuscripcion.PREMIUM,

    nombre: "BarberApp Premium",

    descripcion:
      "La solución completa para cadenas y múltiples sucursales.",

    precio: 55000,

    moneda: "ARS",

    frecuencia: 1,

    frecuenciaTipo: "months",

    pruebaDias: 30,

    mercadopagoPlanId:
      process.env.MP_PLAN_PREMIUM_ID ?? null,

    beneficios: [],
  },
} as const;