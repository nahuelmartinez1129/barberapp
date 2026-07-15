import { prisma } from "@/lib/prisma";
import { verificarAcceso } from "./verificarAcceso";

export async function verificarAccesoBarberia(
  slug: string
) {

  const barberia =
    await prisma.barberia.findUnique({
      where: { slug },
      select: { id: true },
    });

  if (!barberia) {
    return {
      permitida: false,
      motivo: "BARBERIA_NO_EXISTE",
      barberia: null,
      suscripcion: null,
      mensaje: "La barbería no existe.",
    };
  }

  return verificarAcceso(barberia.id);
}