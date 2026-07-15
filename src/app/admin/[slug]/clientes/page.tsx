import { prisma } from "@/lib/prisma";

import {
  obtenerClientesConMetricas,
  calcularMetricasGenerales,
} from "@/lib/clientes";

import { TablaClientes } from "@/components/TablaClientes";
import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

export default async function ClientesAdmin({
  params,
}: {
  params: {
    slug: string;
  };
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

  const clientes =
    await obtenerClientesConMetricas(
      barberia.id
    );

  const metricas =
    calcularMetricasGenerales(
      clientes
    );

  const tarjetas = [
    {
      label: "Total clientes",
      valor:
        metricas.totalClientes.toString(),
    },
    {
      label: "Nuevos este mes",
      valor:
        metricas.clientesNuevosEsteMes.toString(),
    },
    {
      label: "Frecuentes",
      valor:
        metricas.clientesFrecuentes.toString(),
    },
    {
      label: "VIP",
      valor:
        metricas.clientesVip.toString(),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium text-brand-900">
        Clientes
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div
            key={t.label}
            className="rounded-md border border-brand-100 bg-white p-4"
          >
            <p className="mb-1 text-xs text-brand-400">
              {t.label}
            </p>

            <p className="text-2xl font-medium text-brand-900">
              {t.valor}
            </p>
          </div>
        ))}
      </div>

      <TablaClientes
        slug={params.slug}
        clientes={clientes}
      />
    </div>
  );
}