import { NextRequest, NextResponse } from "next/server";
import { obtenerHorarioBarbero } from "@/lib/horarioBarbero";

export async function GET(request: NextRequest) {
  const barberoId = request.nextUrl.searchParams.get("barberoId");

  if (!barberoId) {
    return NextResponse.json({ error: "Falta el parámetro barberoId" }, { status: 400 });
  }

  const horario = await obtenerHorarioBarbero(barberoId);
  return NextResponse.json({ horario });
}
