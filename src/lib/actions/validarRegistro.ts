"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const esquema = z.object({
  email: z.string().email(),
  slug: z.string().optional(),
});

export async function validarRegistro(
  input: z.infer<typeof esquema>
) {
  const datos = esquema.parse(input);

  const email = datos.email
    .trim()
    .toLowerCase();

  const usuario = await prisma.usuario.findUnique({
    where: {
      email,
    },
  });

  if (usuario) {
    throw new Error(
      "Ya existe una cuenta con ese correo."
    );
  }

  if (datos.slug) {
    const slug = datos.slug
      .trim()
      .toLowerCase();

    const barberia =
      await prisma.barberia.findUnique({
        where: {
          slug,
        },
      });

    if (barberia) {
      throw new Error(
        "Ese nombre de barbería ya está siendo utilizado."
      );
    }
  }

  return {
    ok: true,
  };
}