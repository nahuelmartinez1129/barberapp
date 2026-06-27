import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgendaBarbero } from "@/components/AgendaBarbero";

export default async function PaginaBarbero({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const membresia = session.user.membresias.find(
    (m) => m.barberiaSlug === params.slug && m.rol === "BARBERO"
  );
  if (!membresia) redirect("/panel");

  const hoy = new Date();
  const inicioDelDia = new Date(hoy);
  inicioDelDia.setHours(0, 0, 0, 0);
  const finDelDia = new Date(hoy);
  finDelDia.setHours(23, 59, 59, 999);

  const turnosHoy = await prisma.turno.findMany({
    where: {
      barberoId: membresia.miembroId,
      fecha: { gte: inicioDelDia, lte: finDelDia },
      estado: { not: "CANCELADO" },
    },
    include: { cliente: true, servicio: true },
    orderBy: { horaInicio: "asc" },
  });

  return (
    <div className="min-h-screen bg-brand-50 py-6 px-4">
      <AgendaBarbero
        barberiaId={membresia.barberiaId}
        barberoId={membresia.miembroId}
        nombreBarbero={session.user.name ?? ""}
        turnos={turnosHoy.map((t) => ({
          id: t.id,
          fecha: t.fecha.toISOString().slice(0, 10),
          horaInicio: t.horaInicio,
          clienteNombre: t.cliente.nombre,
          servicioNombre: t.servicio.nombre,
          duracionMinutos: t.servicio.duracionMinutos,
          precio: t.precioCobrado.toString(),
          estado: t.estado,
        }))}
      />
    </div>
  );
}
