import { DashboardResumen } from "@/components/dashboard/DashboardResumen";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

import { prisma } from "@/lib/prisma";
import { formatearMoneda } from "@/lib/utils";

export default async function ResumenAdmin({
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

  const hoy = new Date();

  const hoyStr =
    hoy.toISOString().slice(0, 10);

  const inicioDelMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  );

  const [
    todosLosTurnosRecientes,
    clientesNuevosDelMes,
    cantidadBarberos,
    cantidadServicios,
    horariosActivos,
  ] = await Promise.all([
    prisma.turno.findMany({
      where: {
        barberiaId: barberia.id,
        fecha: {
          gte: inicioDelMes,
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
      orderBy: {
        horaInicio: "asc",
      },
    }),

    prisma.cliente.count({
      where: {
        barberiaId: barberia.id,
        createdAt: {
          gte: inicioDelMes,
        },
      },
    }),

    prisma.miembroBarberia.count({
      where: {
        barberiaId: barberia.id,
        rol: "BARBERO",
        activo: true,
      },
    }),

    prisma.servicio.count({
      where: {
        barberiaId: barberia.id,
      },
    }),

    prisma.horarioBarberia.count({
      where: {
        barberiaId: barberia.id,
        activo: true,
      },
    }),
  ]);

  const turnosHoy =
    todosLosTurnosRecientes.filter(
      (t) =>
        t.fecha
          .toISOString()
          .slice(0, 10) === hoyStr
    );

  const turnosDelMes =
    todosLosTurnosRecientes.filter((t) =>
      [
        "COMPLETADO",
        "CONFIRMADO",
        "PENDIENTE",
      ].includes(t.estado)
    );

  const ingresosDelMes =
    turnosDelMes.reduce(
      (acc, t) =>
        acc +
        parseFloat(
          t.precioCobrado.toString()
        ),
      0
    );

  const metricas = [
    {
      label: "Turnos hoy",
      valor: turnosHoy.length.toString(),
    },
    {
      label: "Ingresos del mes",
      valor: formatearMoneda(
        ingresosDelMes
      ),
    },
    {
      label: "Clientes nuevos",
      valor:
        clientesNuevosDelMes.toString(),
    },
    {
      label: "Completados hoy",
      valor: turnosHoy
        .filter(
          (t) =>
            t.estado ===
            "COMPLETADO"
        )
        .length.toString(),
    },
  ];

  const onboardingCompleto =
    cantidadBarberos > 0 &&
    cantidadServicios > 0 &&
    barberia.horariosConfigurados;

  return (
    <div className="space-y-8">
      {!onboardingCompleto && (
        <OnboardingPanel
          slug={params.slug}
          cantidadBarberos={
            cantidadBarberos
          }
          cantidadServicios={
            cantidadServicios
          }
          horariosConfigurados={
            barberia.horariosConfigurados
          }
        />
      )}

      <DashboardResumen
        slug={params.slug}
        hoy={hoy}
        metricas={metricas}
        turnosHoy={turnosHoy}
      />
    </div>
  );
}