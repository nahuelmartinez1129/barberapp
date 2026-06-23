import { NextRequest, NextResponse } from "next/server";
import { obtenerHorariosDisponibles } from "@/lib/disponibilidad";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barberoId = searchParams.get("barberoId");
  const fechaStr = searchParams.get("fecha");
  const duracion = searchParams.get("duracion");

  if (!barberoId || !fechaStr || !duracion) {
    return NextResponse.json(
      { error: "Faltan parámetros: barberoId, fecha, duracion" },
      { status: 400 }
    );
  }

  const horarios = await obtenerHorariosDisponibles({
    barberoId,
    fecha: new Date(fechaStr),
    duracionMinutos: parseInt(duracion),
  });

  return NextResponse.json({ horarios });
}
