import { prisma } from "@/lib/prisma";

import { FormularioDatosBarberia } from "@/components/FormularioDatosBarberia";
import { FormularioHorarios } from "@/components/FormularioHorarios";
import { TarjetaHorariosPorBarbero } from "@/components/TarjetaHorariosPorBarbero";
import { ProteccionSuscripcion } from "@/components/admin/ProteccionSuscripcion";

import { obtenerHorarioBarberia } from "@/lib/horarioBarberia";
import { obtenerHorarioBarbero } from "@/lib/horarioBarbero";

import { requirePaginaAdministracion } from "@/lib/actions/guards/requirePaginaAdministracion";

function SeccionProximamente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-brand-900">
          {titulo}
        </p>

        <span className="badge bg-brand-100 text-brand-500">
          Próximamente
        </span>
      </div>

      <p className="text-sm text-brand-500">
        {descripcion}
      </p>
    </div>
  );
}

export default async function ConfiguracionAdmin({
  params,
}: {
  params: {
    slug: string;
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

  const horario =
    await obtenerHorarioBarberia(
      barberia.id
    );

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
      orderBy: {
        createdAt: "asc",
      },
    });

  const horarioPrimerBarbero =
    barberos.length > 0
      ? await obtenerHorarioBarbero(
          barberos[0].id
        )
      : [];

  return (
    <div>
      <h1 className="mb-6 text-lg font-medium text-brand-900">
        Configuración
      </h1>

      <div className="max-w-2xl space-y-4">
        <FormularioDatosBarberia
          barberia={{
            id: barberia.id,
            nombre: barberia.nombre,
            telefono:
              barberia.telefono,
            direccion:
              barberia.direccion,
            zonaHoraria:
              barberia.zonaHoraria,
            logoUrl:
              barberia.logoUrl,
          }}
        />

        <FormularioHorarios
          barberiaId={barberia.id}
          horarioInicial={horario}
        />

        <TarjetaHorariosPorBarbero
          barberos={barberos.map(
            (b) => ({
              id: b.id,
              nombre:
                b.usuario.nombre,
            })
          )}
          horarioInicial={
            horarioPrimerBarbero
          }
        />

        {/* Futuras configuraciones */}

        {/* <SeccionProximamente
          titulo="Notificaciones"
          descripcion="Configurá WhatsApp, email y recordatorios automáticos."
        />

        <SeccionProximamente
          titulo="Integraciones"
          descripcion="Conectá BarberApp con Mercado Pago y otras herramientas."
        /> */}
      </div>
    </div>
  );
}