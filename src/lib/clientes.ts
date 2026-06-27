import { prisma } from "@/lib/prisma";

export type ClasificacionCliente = "NUEVO" | "FRECUENTE" | "VIP";

export type ClienteConMetricas = {
  clienteId: string;
  nombre: string;
  email: string;
  telefono: string | null;
  visitas: number; // turnos COMPLETADOS
  totalGastado: number; // suma precioCobrado de COMPLETADOS
  ultimaVisita: Date | null; // fecha del COMPLETADO mas reciente
  clasificacion: ClasificacionCliente;
};

function clasificar(visitas: number): ClasificacionCliente {
  if (visitas > 5) return "VIP";
  if (visitas >= 2) return "FRECUENTE";
  return "NUEVO";
}

/**
 * Devuelve todos los clientes que tienen al menos un turno registrado
 * en esta barberia, con sus metricas agregadas (visitas, gasto, ultima
 * visita) calculadas exclusivamente sobre turnos en estado COMPLETADO.
 *
 * Los clientes sin ningun turno (es decir, MiembroBarberia con rol CLIENTE
 * pero sin Turno asociado) no se incluyen, segun lo pedido.
 */
export async function obtenerClientesConMetricas(
  barberiaId: string
): Promise<ClienteConMetricas[]> {
  // Traemos todos los turnos de la barberia (cualquier estado) para poder
  // calcular tanto las metricas de COMPLETADOS como, en el detalle, las
  // cancelaciones/no-asistencias. Para el listado solo necesitamos agrupar.
  const turnos = await prisma.turno.findMany({
    where: { barberiaId },
    select: {
      clienteId: true,
      estado: true,
      precioCobrado: true,
      fecha: true,
      cliente: {
        select: { id: true, nombre: true, email: true, telefono: true },
      },
    },
  });

  const porCliente = new Map<
    string,
    {
      nombre: string;
      email: string;
      telefono: string | null;
      visitas: number;
      totalGastado: number;
      ultimaVisita: Date | null;
    }
  >();

  for (const turno of turnos) {
    if (!porCliente.has(turno.clienteId)) {
      porCliente.set(turno.clienteId, {
        nombre: turno.cliente.nombre,
        email: turno.cliente.email,
        telefono: turno.cliente.telefono,
        visitas: 0,
        totalGastado: 0,
        ultimaVisita: null,
      });
    }

    if (turno.estado !== "COMPLETADO") continue;

    const acumulado = porCliente.get(turno.clienteId)!;
    acumulado.visitas += 1;
    acumulado.totalGastado += parseFloat(turno.precioCobrado.toString());
    if (!acumulado.ultimaVisita || turno.fecha > acumulado.ultimaVisita) {
      acumulado.ultimaVisita = turno.fecha;
    }
  }

  const resultado: ClienteConMetricas[] = [];
  for (const [clienteId, datos] of porCliente.entries()) {
    resultado.push({
      clienteId,
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      visitas: datos.visitas,
      totalGastado: datos.totalGastado,
      ultimaVisita: datos.ultimaVisita,
      clasificacion: clasificar(datos.visitas),
    });
  }

  return resultado;
}

export type EstadisticasCliente = {
  servicioFavorito: string | null;
  barberoFavorito: string | null;
  promedioGastadoPorVisita: number;
  cancelaciones: number;
  noAsistencias: number;
};

export type TurnoHistorialCliente = {
  id: string;
  fecha: Date;
  servicioNombre: string;
  barberoNombre: string;
  estado: string;
  precioCobrado: number;
};

export type ProximoTurnoCliente = {
  id: string;
  fecha: Date;
  horaInicio: string;
  servicioNombre: string;
  barberoId: string;
  barberoNombre: string;
  duracionMinutos: number;
  estado: string;
};

export type DetalleCliente = {
  clienteId: string;
  nombre: string;
  email: string;
  telefono: string | null;
  visitas: number;
  totalGastado: number;
  ultimaVisita: Date | null;
  clienteDesde: Date | null;
  proximoTurno: ProximoTurnoCliente | null;
  clasificacion: ClasificacionCliente;
  estadisticas: EstadisticasCliente;
  historial: TurnoHistorialCliente[];
};

/**
 * Devuelve el detalle completo de un cliente dentro de una barberia puntual:
 * sus metricas, estadisticas (servicio/barbero favorito, promedio, etc.)
 * y el historial completo de turnos (en cualquier estado).
 */
export async function obtenerDetalleCliente(
  barberiaId: string,
  clienteId: string
): Promise<DetalleCliente | null> {
  const turnos = await prisma.turno.findMany({
    where: { barberiaId, clienteId },
    include: {
      servicio: { select: { nombre: true, duracionMinutos: true } },
      barbero: { include: { usuario: { select: { nombre: true } } } },
      cliente: { select: { id: true, nombre: true, email: true, telefono: true } },
    },
    orderBy: { fecha: "desc" },
  });

  if (turnos.length === 0) return null;

  const cliente = turnos[0].cliente;

  // "Cliente desde": fecha en la que se vinculo como CLIENTE a esta barberia.
  const membresia = await prisma.miembroBarberia.findUnique({
    where: { barberiaId_usuarioId: { barberiaId, usuarioId: clienteId } },
    select: { createdAt: true },
  });

  let visitas = 0;
  let totalGastado = 0;
  let ultimaVisita: Date | null = null;
  let cancelaciones = 0;
  let noAsistencias = 0;

  const conteoServicios = new Map<string, number>();
  const conteoBarberos = new Map<string, number>();

  for (const t of turnos) {
    if (t.estado === "CANCELADO") cancelaciones += 1;
    if (t.estado === "NO_ASISTIO") noAsistencias += 1;

    if (t.estado === "COMPLETADO") {
      visitas += 1;
      totalGastado += parseFloat(t.precioCobrado.toString());
      if (!ultimaVisita || t.fecha > ultimaVisita) ultimaVisita = t.fecha;

      conteoServicios.set(
        t.servicio.nombre,
        (conteoServicios.get(t.servicio.nombre) ?? 0) + 1
      );
      conteoBarberos.set(
        t.barbero.usuario.nombre,
        (conteoBarberos.get(t.barbero.usuario.nombre) ?? 0) + 1
      );
    }
  }

  const masFrecuente = (mapa: Map<string, number>): string | null => {
    let mejor: string | null = null;
    let mejorConteo = 0;
    for (const [clave, conteo] of mapa.entries()) {
      if (conteo > mejorConteo) {
        mejor = clave;
        mejorConteo = conteo;
      }
    }
    return mejor;
  };

  const historial: TurnoHistorialCliente[] = turnos.map((t) => ({
    id: t.id,
    fecha: t.fecha,
    servicioNombre: t.servicio.nombre,
    barberoNombre: t.barbero.usuario.nombre,
    estado: t.estado,
    precioCobrado: parseFloat(t.precioCobrado.toString()),
  }));

  // Proximo turno: el mas cercano en el futuro (o hoy) que no este
  // cancelado ni completado. turnos viene ordenado desc por fecha, asi
  // que buscamos el de fecha mas chica entre los que cumplen la condicion.
  const hoyStr = new Date().toISOString().slice(0, 10);
  const turnosFuturosPendientes = turnos.filter(
    (t) =>
      t.fecha.toISOString().slice(0, 10) >= hoyStr &&
      t.estado !== "CANCELADO" &&
      t.estado !== "COMPLETADO" &&
      t.estado !== "NO_ASISTIO"
  );
  const proximoTurnoRaw = turnosFuturosPendientes.sort(
    (a, b) =>
      a.fecha.getTime() - b.fecha.getTime() || a.horaInicio.localeCompare(b.horaInicio)
  )[0];

  const proximoTurno: ProximoTurnoCliente | null = proximoTurnoRaw
    ? {
        id: proximoTurnoRaw.id,
        fecha: proximoTurnoRaw.fecha,
        horaInicio: proximoTurnoRaw.horaInicio,
        servicioNombre: proximoTurnoRaw.servicio.nombre,
        barberoId: proximoTurnoRaw.barberoId,
        barberoNombre: proximoTurnoRaw.barbero.usuario.nombre,
        duracionMinutos: proximoTurnoRaw.servicio.duracionMinutos,
        estado: proximoTurnoRaw.estado,
      }
    : null;

  return {
    clienteId,
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    visitas,
    totalGastado,
    ultimaVisita,
    clienteDesde: membresia?.createdAt ?? null,
    proximoTurno,
    clasificacion: clasificar(visitas),
    estadisticas: {
      servicioFavorito: masFrecuente(conteoServicios),
      barberoFavorito: masFrecuente(conteoBarberos),
      promedioGastadoPorVisita: visitas > 0 ? totalGastado / visitas : 0,
      cancelaciones,
      noAsistencias,
    },
    historial,
  };
}

/**
 * Metricas agregadas para las tarjetas superiores de la pagina de Clientes.
 */
export function calcularMetricasGenerales(clientes: ClienteConMetricas[]) {
  const inicioDelMes = new Date();
  inicioDelMes.setDate(1);
  inicioDelMes.setHours(0, 0, 0, 0);

  return {
    totalClientes: clientes.length,
    clientesNuevosEsteMes: clientes.filter(
      (c) => c.ultimaVisita && c.visitas === 1 && c.ultimaVisita >= inicioDelMes
    ).length,
    clientesFrecuentes: clientes.filter((c) => c.clasificacion === "FRECUENTE").length,
    clientesVip: clientes.filter((c) => c.clasificacion === "VIP").length,
  };
}
