import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verificarAccesoBarberia } from "@/lib/suscripcion";
import { ReservaWizard } from "@/components/ReservaWizard";
import { VistaReservaCliente } from "@/components/VistaReservaCliente";
import { notFound } from "next/navigation";

export default async function PaginaReserva({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });

  if (!barberia) notFound();

  const estadoAcceso = await verificarAccesoBarberia(barberia.id);

  if (!estadoAcceso.tieneAcceso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="card max-w-sm text-center">
          <p className="font-medium text-brand-900 mb-2">
            {barberia.nombre}
          </p>
          <p className="text-sm text-brand-500">
            Esta página de reservas no está disponible en este momento. Contactá
            directamente a la barbería por teléfono.
          </p>
          {barberia.telefono && (
            <p className="text-sm text-brand-700 mt-3 font-medium">
              {barberia.telefono}
            </p>
          )}
        </div>
      </div>
    );
  }

  const servicios = await prisma.servicio.findMany({
    where: { barberiaId: barberia.id, activo: true },
    orderBy: { orden: "asc" },
    include: {
      barberosAsignados: {
        include: { barbero: { include: { usuario: true } } },
      },
    },
  });

  const session = await getServerSession(authOptions);

  let turnosCliente: {
    id: string;
    fecha: string;
    horaInicio: string;
    estado: string;
    precioCobrado: string;
    servicioNombre: string;
    barberoNombre: string;
  }[] = [];

  if (session?.user) {
    const turnos = await prisma.turno.findMany({
      where: { barberiaId: barberia.id, clienteId: session.user.id },
      include: { servicio: true, barbero: { include: { usuario: true } } },
      orderBy: { fecha: "desc" },
    });

    turnosCliente = turnos.map((t) => ({
      id: t.id,
      fecha: t.fecha.toISOString(),
      horaInicio: t.horaInicio,
      estado: t.estado,
      precioCobrado: t.precioCobrado.toString(),
      servicioNombre: t.servicio.nombre,
      barberoNombre: t.barbero.usuario.nombre,
    }));
  }

  return (
    <div className="min-h-screen bg-brand-50 py-8 px-4">
      <VistaReservaCliente
        haySesion={!!session?.user}
        turnosCliente={turnosCliente}
        wizard={<ReservaWizard barberia={barberia} servicios={servicios} />}
      />
    </div>
  );
}
