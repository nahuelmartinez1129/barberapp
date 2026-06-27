import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerDetalleCliente } from "@/lib/clientes";
import { formatearMoneda } from "@/lib/utils";
import { BadgeClasificacion } from "@/components/BadgeClasificacion";
import { HistorialCliente } from "@/components/HistorialCliente";
import { notFound } from "next/navigation";

function formatearFechaCorta(fecha: Date | null): string {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

export default async function DetalleClienteAdmin({
  params,
}: {
  params: { slug: string; clienteId: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) return null;

  const detalle = await obtenerDetalleCliente(barberia.id, params.clienteId);
  if (!detalle) notFound();

  const estadisticas = [
    { label: "Servicio favorito", valor: detalle.estadisticas.servicioFavorito ?? "—" },
    { label: "Barbero favorito", valor: detalle.estadisticas.barberoFavorito ?? "—" },
    {
      label: "Promedio por visita",
      valor: formatearMoneda(detalle.estadisticas.promedioGastadoPorVisita),
    },
    { label: "Cancelaciones", valor: detalle.estadisticas.cancelaciones.toString() },
    { label: "No asistencias", valor: detalle.estadisticas.noAsistencias.toString() },
  ];

  return (
    <div>
      <Link
        href={`/admin/${params.slug}/clientes`}
        className="text-sm text-brand-500 hover:text-brand-900 inline-block mb-4"
      >
        ← Volver a clientes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-medium text-brand-900">{detalle.nombre}</h1>
          <p className="text-sm text-brand-500">{detalle.email}</p>
          <p className="text-sm text-brand-500">{detalle.telefono ?? "Sin teléfono registrado"}</p>
        </div>
        <BadgeClasificacion clasificacion={detalle.clasificacion} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-brand-100 rounded-md p-4">
          <p className="text-xs text-brand-400 mb-1">Visitas</p>
          <p className="text-2xl font-medium text-brand-900">{detalle.visitas}</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-md p-4">
          <p className="text-xs text-brand-400 mb-1">Total gastado</p>
          <p className="text-2xl font-medium text-brand-900">
            {formatearMoneda(detalle.totalGastado)}
          </p>
        </div>
        <div className="bg-white border border-brand-100 rounded-md p-4">
          <p className="text-xs text-brand-400 mb-1">Última visita</p>
          <p className="text-2xl font-medium text-brand-900">
            {formatearFechaCorta(detalle.ultimaVisita)}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-medium text-brand-700 mb-3">Estadísticas</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {estadisticas.map((e) => (
          <div key={e.label} className="bg-white border border-brand-100 rounded-md p-3.5">
            <p className="text-xs text-brand-400 mb-1">{e.label}</p>
            <p className="text-base font-medium text-brand-900 truncate">{e.valor}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium text-brand-700 mb-3">Historial de turnos</h2>
      <HistorialCliente turnos={detalle.historial} />
    </div>
  );
}
