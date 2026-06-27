import { NextRequest, NextResponse } from "next/server";
import { obtenerDetalleCliente } from "@/lib/clientes";

function formatearFechaCorta(fecha: Date | null): string | null {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clienteId: string } }
) {
  const barberiaId = request.nextUrl.searchParams.get("barberiaId");

  if (!barberiaId) {
    return NextResponse.json({ error: "Falta el parámetro barberiaId" }, { status: 400 });
  }

  // Reutiliza exactamente la misma logica que ya usa la pagina de
  // detalle de cliente en /admin/[slug]/clientes/[clienteId].
  const detalle = await obtenerDetalleCliente(barberiaId, params.clienteId);

  if (!detalle) {
    return NextResponse.json({ detalle: null });
  }

  return NextResponse.json({
    detalle: {
      nombre: detalle.nombre,
      telefono: detalle.telefono,
      visitas: detalle.visitas,
      totalGastado: detalle.totalGastado,
      ultimaVisita: formatearFechaCorta(detalle.ultimaVisita),
      clienteDesde: formatearFechaCorta(detalle.clienteDesde),
      proximoTurno: detalle.proximoTurno
        ? {
            id: detalle.proximoTurno.id,
            fecha: detalle.proximoTurno.fecha.toISOString().slice(0, 10),
            horaInicio: detalle.proximoTurno.horaInicio,
            servicioNombre: detalle.proximoTurno.servicioNombre,
            barberoId: detalle.proximoTurno.barberoId,
            barberoNombre: detalle.proximoTurno.barberoNombre,
            duracionMinutos: detalle.proximoTurno.duracionMinutos,
          }
        : null,
      historialReciente: detalle.historial.slice(0, 5).map((h) => ({
        id: h.id,
        fecha: formatearFechaCorta(h.fecha),
        servicioNombre: h.servicioNombre,
        estado: h.estado,
      })),
    },
  });
}
