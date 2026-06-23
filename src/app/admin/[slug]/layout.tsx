import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verificarAccesoBarberia } from "@/lib/suscripcion";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { AvisoSuscripcion } from "@/components/AvisoSuscripcion";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const membresia = session.user.membresias.find(
    (m) => m.barberiaSlug === params.slug && m.rol === "DUENO"
  );
  if (!membresia) redirect("/panel");

  const barberia = await prisma.barberia.findUnique({
    where: { slug: params.slug },
  });
  if (!barberia) redirect("/panel");

  const estadoAcceso = await verificarAccesoBarberia(barberia.id);

  return (
    <div className="min-h-screen bg-brand-50 overflow-x-hidden lg:flex">
      <SidebarAdmin
        slug={params.slug}
        nombreBarberia={barberia.nombre}
        estadoAcceso={estadoAcceso}
      />
      <main className="flex-1 p-4 lg:p-6 min-w-0 max-w-full">
        {!estadoAcceso.tieneAcceso ? (
          <AvisoSuscripcion estadoAcceso={estadoAcceso} slug={params.slug} />
        ) : (
          <>
            {estadoAcceso.mensaje && estadoAcceso.estado === "VENCIDA" && (
              <div className="mb-4 bg-warning-50 text-warning-700 text-sm px-4 py-3 rounded-md">
                {estadoAcceso.mensaje}
              </div>
            )}
            {children}
          </>
        )}
      </main>
    </div>
  );
}
