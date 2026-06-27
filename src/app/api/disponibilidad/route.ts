import { NextRequest, NextResponse } from "next/server";
import { obtenerHorariosDisponibles } from "@/lib/disponibilidad";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barberiaId = searchParams.get("barberiaId");
  const barberoId = searchParams.get("barberoId");
  const fechaStr = searchParams.get("fecha");
  const duracion = searchParams.get("duracion");
  const excluirTurnoId = searchParams.get("excluirTurnoId") ?? undefined;

  if (!barberiaId || !barberoId || !fechaStr || !duracion) {
    return NextResponse.json(
      { error: "Faltan parámetros: barberiaId, barberoId, fecha, duracion" },
      { status: 400 }
    );
  }

  const horarios = await obtenerHorariosDisponibles({
    barberiaId,
    barberoId,
    fecha: new Date(fechaStr),
    duracionMinutos: parseInt(duracion),
    excluirTurnoId,
  });

  return NextResponse.json({ horarios });
}
