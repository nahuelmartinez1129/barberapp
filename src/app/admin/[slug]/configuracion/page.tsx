import { prisma } from "@/lib/prisma";
import { FormularioDatosBarberia } from "@/components/FormularioDatosBarberia";
import { FormularioHorarios } from "@/components/FormularioHorarios";
import { TarjetaHorariosPorBarbero } from "@/components/TarjetaHorariosPorBarbero";
import { obtenerHorarioBarberia } from "@/lib/horarioBarberia";
import { obtenerHorarioBarbero } from "@/lib/horarioBarbero";

function SeccionProximamente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-brand-900">{titulo}</p>
        <span className="badge bg-brand-100 text-brand-500">Próximamente</span>
      </div>
      <p className="text-sm text-brand-500">{descripcion}</p>
    </div>
  );
}

export default async function ConfiguracionAdmin({
  params,
}: {
  params: { slug: string };
}) {
  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) return null;

  const horario = await obtenerHorarioBarberia(barberia.id);

  const barberos = await prisma.miembroBarberia.findMany({
    where: { barberiaId: barberia.id, rol: "BARBERO", activo: true },
    include: { usuario: true },
    orderBy: { createdAt: "asc" },
  });

  // Precargamos el horario del primer barbero en el server, para que la
  // tarjeta no arranque con un fetch innecesario en el cliente.
  const horarioPrimerBarbero = barberos.length > 0
    ? await obtenerHorarioBarbero(barberos[0].id)
    : [];

  return (
    <div>
      <h1 className="text-lg font-medium text-brand-900 mb-6">Configuración</h1>

      <div className="space-y-4 max-w-2xl">
        <FormularioDatosBarberia
          barberia={{
            id: barberia.id,
            nombre: barberia.nombre,
            telefono: barberia.telefono,
            direccion: barberia.direccion,
            zonaHoraria: barberia.zonaHoraria,
            logoUrl: barberia.logoUrl,
          }}
        />
        <FormularioHorarios barberiaId={barberia.id} horarioInicial={horario} />
        <TarjetaHorariosPorBarbero
          barberos={barberos.map((b) => ({ id: b.id, nombre: b.usuario.nombre }))}
          horarioInicial={horarioPrimerBarbero}
        />
        <SeccionProximamente
          titulo="Cuenta y suscripción"
          descripcion="Próximamente vas a poder ver el estado de tu plan, el historial de pagos y cambiar de plan desde aquí."
        />
      </div>
    </div>
  );
}
