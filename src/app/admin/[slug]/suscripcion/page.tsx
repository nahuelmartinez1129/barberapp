import { prisma } from "@/lib/prisma";
import { ResumenSuscripcionCard } from "@/components/suscripcion/ResumenSuscripcionCard";
import { PlanBarberAppCard } from "@/components/suscripcion/PlanBarberAppCard";
import { HistorialPagosCard } from "@/components/suscripcion/HistorialPagosCard";
export default async function SuscripcionPage({
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
    include: {
      suscripcion: true,
      
    },
  });

  if (!barberia || !barberia.suscripcion) {
    return null;
  }

  const suscripcion = barberia.suscripcion;

 

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-brand-900">
          Suscripción
        </h1>
       


        <p className="mt-2 text-brand-500">
          Administrá tu plan, el estado de tu suscripción y tus pagos.
        </p>
      </div>

 <ResumenSuscripcionCard
    suscripcion={suscripcion}
/>


      {/* PLAN */}

     <PlanBarberAppCard
  suscripcion={suscripcion}
/>
    


      {/* HISTORIAL */}

     <HistorialPagosCard />
    </div>
  );
}