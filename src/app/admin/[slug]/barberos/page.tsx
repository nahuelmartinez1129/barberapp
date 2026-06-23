import { prisma } from "@/lib/prisma";
import { FormularioBarbero } from "@/components/FormularioBarbero";
import { TarjetaBarbero } from "@/components/TarjetaBarbero";

export default async function BarberosAdmin({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) return null;

  const barberos = await prisma.miembroBarberia.findMany({
    where: { barberiaId: barberia.id, rol: "BARBERO" },
    include: {
      usuario: true,
      serviciosAsignados: { include: { servicio: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-brand-900">Barberos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 order-2 lg:order-1">
          {barberos.length === 0 && (
            <p className="text-sm text-brand-400">
              Todavía no agregaste ningún barbero. Usá el formulario para crear el primero.
            </p>
          )}
          {barberos.map((b) => (
            <TarjetaBarbero
              key={b.id}
              barberiaId={barberia.id}
              barbero={{
                id: b.id,
                activo: b.activo,
                colorAgenda: b.colorAgenda ?? "#3b82f6",
                usuario: {
                  nombre: b.usuario.nombre,
                  email: b.usuario.email,
                  telefono: b.usuario.telefono,
                },
                serviciosAsignados: b.serviciosAsignados.map((bs) => ({
                  id: bs.id,
                  servicio: { nombre: bs.servicio.nombre },
                })),
              }}
            />
          ))}
        </div>

        <div className="order-1 lg:order-2">
          <FormularioBarbero barberiaId={barberia.id} />
        </div>
      </div>
    </div>
  );
}
