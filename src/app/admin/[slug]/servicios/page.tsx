import { prisma } from "@/lib/prisma";

import { FormularioServicio } from "@/components/FormularioServicio";
import { TarjetaServicio } from "@/components/TarjetaServicio";
import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

export default async function ServiciosAdmin({
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

  const servicios =
    await prisma.servicio.findMany({
      where: {
        barberiaId: barberia.id,
      },
      orderBy: {
        orden: "asc",
      },
      include: {
        barberosAsignados: {
          include: {
            barbero: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

  const barberos =
    await prisma.miembroBarberia.findMany({
      where: {
        barberiaId: barberia.id,
        rol: "BARBERO",
        activo: true,
      },
      include: {
        usuario: true,
      },
    });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-medium text-brand-900">
          Servicios
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="order-2 space-y-2 lg:order-1">
          {servicios.length === 0 && (
            <p className="text-sm text-brand-400">
              Todavía no creaste ningún
              servicio. Usá el formulario
              para agregar el primero.
            </p>
          )}

          {servicios.map((servicio) => (
            <TarjetaServicio
              key={servicio.id}
              barberiaId={barberia.id}
              barberos={barberos}
              servicio={{
                id: servicio.id,
                nombre: servicio.nombre,
                precio:
                  servicio.precio.toString(),
                duracionMinutos:
                  servicio.duracionMinutos,
                activo: servicio.activo,

                barberosAsignados:
                  servicio.barberosAsignados.map(
                    (bs) => ({
                      id: bs.id,

                      barbero: {
                        id: bs.barbero.id,

                        usuario: {
                          nombre:
                            bs.barbero
                              .usuario.nombre,
                        },
                      },
                    })
                  ),
              }}
            />
          ))}
        </div>

        <div className="order-1 lg:order-2">
          <FormularioServicio
            barberiaId={barberia.id}
            barberos={barberos}
          />
        </div>
      </div>
    </div>
  );
}