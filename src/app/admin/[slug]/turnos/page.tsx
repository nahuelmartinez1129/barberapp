import { prisma } from "@/lib/prisma";

import { ListaTurnos } from "@/components/ListaTurnos";
import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

export default async function TurnosAdmin({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!barberia) {
    return null;
  }

  const acceso =
    await requirePaginaAdministracion(
      barberia.id
    );

  if (!acceso.permitida) {
    return (
      <ProteccionSuscripcion
        acceso={acceso}
        slug={params.slug}
      />
    );
  }

  // Traemos un rango razonable:
  // 30 días atrás a 60 días adelante.
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const hasta = new Date();
  hasta.setDate(hasta.getDate() + 60);

  const [turnos, barberos, servicios] =
    await Promise.all([
      prisma.turno.findMany({
        where: {
          barberiaId: barberia.id,
          fecha: {
            gte: desde,
            lte: hasta,
          },
        },
        include: {
          cliente: true,
          servicio: true,
          barbero: {
            include: {
              usuario: true,
            },
          },
        },
        orderBy: [
          {
            fecha: "asc",
          },
          {
            horaInicio: "asc",
          },
        ],
      }),

      prisma.miembroBarberia.findMany({
        where: {
          barberiaId: barberia.id,
          rol: "BARBERO",
          activo: true,
        },
        include: {
          usuario: true,
        },
      }),

      prisma.servicio.findMany({
        where: {
          barberiaId: barberia.id,
          activo: true,
        },
        include: {
          barberosAsignados: {
            select: {
              barberoId: true,
            },
          },
        },
        orderBy: {
          orden: "asc",
        },
      }),
    ]);

  const hoy =
    new Date()
      .toISOString()
      .slice(0, 10);

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium text-brand-900">
        Turnos
      </h1>

      <ListaTurnos
        barberiaId={barberia.id}
        fechaInicial={hoy}
        barberos={barberos.map((b) => ({
          id: b.id,
          nombre: b.usuario.nombre,
        }))}
        servicios={servicios.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          precio: s.precio.toString(),
          duracionMinutos:
            s.duracionMinutos,
          barberoIds:
            s.barberosAsignados.map(
              (bs) => bs.barberoId
            ),
        }))}
        turnos={turnos.map((t) => ({
          id: t.id,
          fecha:
            t.fecha.toISOString(),
          horaInicio:
            t.horaInicio,
          estado: t.estado,
          precioCobrado:
            t.precioCobrado.toString(),
          duracionMinutos:
            t.servicio
              .duracionMinutos,
          clienteId:
            t.clienteId,
          clienteNombre:
            t.cliente.nombre,
          clienteTelefono:
            t.cliente.telefono,
          servicioNombre:
            t.servicio.nombre,
          barberoId:
            t.barberoId,
          barberoNombre:
            t.barbero.usuario
              .nombre,
          barberoColor:
            t.barbero
              .colorAgenda ??
            "#3b82f6",
        }))}
      />
    </div>
  );
}