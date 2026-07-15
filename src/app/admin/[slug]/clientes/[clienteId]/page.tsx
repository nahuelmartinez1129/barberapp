import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerDetalleCliente } from "@/lib/clientes";
import { formatearMoneda } from "@/lib/utils";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";
import { BadgeClasificacion } from "@/components/BadgeClasificacion";
import { HistorialCliente } from "@/components/HistorialCliente";

function formatearFechaCorta(
  fecha: Date | null
): string {
  if (!fecha) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(fecha);
}

export default async function DetalleClienteAdmin({
  params,
}: {
  params: {
    slug: string;
    clienteId: string;
  };
}) {
  const barberia =
    await prisma.barberia.findUnique({
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

  const detalle =
    await obtenerDetalleCliente(
      barberia.id,
      params.clienteId
    );

  if (!detalle) {
    notFound();
  }

  const estadisticas = [
    {
      label: "Servicio favorito",
      valor:
        detalle.estadisticas
          .servicioFavorito ?? "—",
    },
    {
      label: "Barbero favorito",
      valor:
        detalle.estadisticas
          .barberoFavorito ?? "—",
    },
    {
      label: "Promedio por visita",
      valor: formatearMoneda(
        detalle.estadisticas
          .promedioGastadoPorVisita
      ),
    },
    {
      label: "Cancelaciones",
      valor:
        detalle.estadisticas
          .cancelaciones.toString(),
    },
    {
      label: "No asistencias",
      valor:
        detalle.estadisticas
          .noAsistencias.toString(),
    },
  ];

  return (
    <div>
      <Link
        href={`/admin/${params.slug}/clientes`}
        className="mb-4 inline-block text-sm text-brand-500 hover:text-brand-900"
      >
        ← Volver a clientes
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-medium text-brand-900">
            {detalle.nombre}
          </h1>

          <p className="text-sm text-brand-500">
            {detalle.telefono}
          </p>

          {detalle.email && (
            <p className="text-sm text-brand-500">
              {detalle.email}
            </p>
          )}
        </div>

        <BadgeClasificacion
          clasificacion={
            detalle.clasificacion
          }
        />
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-brand-100 bg-white p-4">
          <p className="mb-1 text-xs text-brand-400">
            Visitas
          </p>

          <p className="text-2xl font-medium text-brand-900">
            {detalle.visitas}
          </p>
        </div>

        <div className="rounded-md border border-brand-100 bg-white p-4">
          <p className="mb-1 text-xs text-brand-400">
            Total gastado
          </p>

          <p className="text-2xl font-medium text-brand-900">
            {formatearMoneda(
              detalle.totalGastado
            )}
          </p>
        </div>

        <div className="rounded-md border border-brand-100 bg-white p-4">
          <p className="mb-1 text-xs text-brand-400">
            Última visita
          </p>

          <p className="text-2xl font-medium text-brand-900">
            {formatearFechaCorta(
              detalle.ultimaVisita
            )}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-medium text-brand-700">
        Estadísticas
      </h2>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {estadisticas.map((e) => (
          <div
            key={e.label}
            className="rounded-md border border-brand-100 bg-white p-3.5"
          >
            <p className="mb-1 text-xs text-brand-400">
              {e.label}
            </p>

            <p className="truncate text-base font-medium text-brand-900">
              {e.valor}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-medium text-brand-700">
        Historial de turnos
      </h2>

      <HistorialCliente
        turnos={detalle.historial}
      />
    </div>
  );
}