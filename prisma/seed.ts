import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {


  const passwordHash = await bcrypt.hash("password123", 10);

  // ---- Barbería ----
  const barberia = await prisma.barberia.create({
    data: {
      nombre: "Barbería El Zorro",
      slug: "el-zorro",
      telefono: "+54 9 11 1234-5678",
      direccion: "Av. Siempre Viva 742",
    },
  });

  // ---- Suscripción en período de prueba ----
  await prisma.suscripcion.create({
    data: {
      barberiaId: barberia.id,
      plan: "PRO",
      estado: "PRUEBA",
      precioMensual: 15000,
      fechaProximoPago: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
    },
  });

  // ---- Dueño ----
  const dueno = await prisma.usuario.create({
    data: {
      nombre: "Roberto Gómez",
      email: "dueno@elzorro.com",
      passwordHash,
    },
  });
  await prisma.miembroBarberia.create({
    data: { barberiaId: barberia.id, usuarioId: dueno.id, rol: "DUENO" },
  });


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
