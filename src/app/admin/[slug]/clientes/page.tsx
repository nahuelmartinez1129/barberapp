import { prisma } from "@/lib/prisma";
import { obtenerClientesConMetricas, calcularMetricasGenerales } from "@/lib/clientes";
import { TablaClientes } from "@/components/TablaClientes";

export default async function ClientesAdmin({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) return null;

  const clientes = await obtenerClientesConMetricas(barberia.id);
  const metricas = calcularMetricasGenerales(clientes);

  const tarjetas = [
    { label: "Total clientes", valor: metricas.totalClientes.toString() },
    { label: "Nuevos este mes", valor: metricas.clientesNuevosEsteMes.toString() },
    { label: "Frecuentes", valor: metricas.clientesFrecuentes.toString() },
    { label: "VIP", valor: metricas.clientesVip.toString() },
  ];

  return (
    <div>
      <h1 className="text-lg font-medium text-brand-900 mb-6">Clientes</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {tarjetas.map((t) => (
          <div key={t.label} className="bg-white border border-brand-100 rounded-md p-4">
            <p className="text-xs text-brand-400 mb-1">{t.label}</p>
            <p className="text-2xl font-medium text-brand-900">{t.valor}</p>
          </div>
        ))}
      </div>

      <TablaClientes slug={params.slug} clientes={clientes} />
    </div>
  );
}
