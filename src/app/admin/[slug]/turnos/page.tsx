import { prisma } from "@/lib/prisma";
import { ListaTurnos } from "@/components/ListaTurnos";

export default async function TurnosAdmin({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) return null;

  // Traemos un rango razonable: 30 dias atras a 60 dias adelante,
  // el filtro de fecha en el cliente elige el dia puntual a mostrar.
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  const hasta = new Date();
  hasta.setDate(hasta.getDate() + 60);

  const [turnos, barberos] = await Promise.all([
    prisma.turno.findMany({
      where: { barberiaId: barberia.id, fecha: { gte: desde, lte: hasta } },
      include: {
        cliente: true,
        servicio: true,
        barbero: { include: { usuario: true } },
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    }),
    prisma.miembroBarberia.findMany({
      where: { barberiaId: barberia.id, rol: "BARBERO", activo: true },
      include: { usuario: true },
    }),
  ]);

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-lg font-medium text-brand-900 mb-6">Turnos</h1>
      <ListaTurnos
        fechaInicial={hoy}
        barberos={barberos.map((b) => ({ id: b.id, nombre: b.usuario.nombre }))}
        turnos={turnos.map((t) => ({
          id: t.id,
          fecha: t.fecha.toISOString(),
          horaInicio: t.horaInicio,
          estado: t.estado,
          precioCobrado: t.precioCobrado.toString(),
          clienteNombre: t.cliente.nombre,
          servicioNombre: t.servicio.nombre,
          barberoId: t.barberoId,
          barberoNombre: t.barbero.usuario.nombre,
          barberoColor: t.barbero.colorAgenda ?? "#3b82f6",
        }))}
      />
    </div>
  );
}
