"use server";

import { prisma } from "@/lib/prisma";
import { subirImagen } from "@/lib/uploads";
import { z } from "zod";

import { ZONAS_HORARIAS_SOPORTADAS } from "@/lib/zonas-horarias";

const esquemaDatosBarberia = z.object({
  barberiaId: z.string(),
  nombre: z.string().min(2),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  zonaHoraria: z.string(),
});

/**
 * Actualiza los datos editables de la barberia. El logo se maneja aparte
 * (ver subirLogoBarberia) porque llega como FormData con un archivo, no
 * como JSON simple.
 */
export async function actualizarDatosBarberia(
  input: z.infer<typeof esquemaDatosBarberia>
) {
  const datos = esquemaDatosBarberia.parse(input);

  return prisma.barberia.update({
    where: { id: datos.barberiaId },
    data: {
      nombre: datos.nombre,
      telefono: datos.telefono || null,
      direccion: datos.direccion || null,
      zonaHoraria: datos.zonaHoraria,
    },
  });
}

/**
 * Sube un logo nuevo y actualiza Barberia.logoUrl.
 * Si no se sube nada (el FormData no trae archivo, o esta vacio),
 * no se toca el logo actual: se mantiene el que ya estaba.
 */
export async function subirLogoBarberia(barberiaId: string, formData: FormData) {
  const archivo = formData.get("logo") as File | null;

  if (!archivo || archivo.size === 0) {
    // No se subio nada nuevo: mantenemos el logo actual sin hacer nada.
    return null;
  }

  const url = await subirImagen(archivo, "logos");

  await prisma.barberia.update({
    where: { id: barberiaId },
    data: { logoUrl: url },
  });

  return url;
}
