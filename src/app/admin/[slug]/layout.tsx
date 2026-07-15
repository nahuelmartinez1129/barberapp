import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { verificarAccesoBarberia } from "@/lib/actions/verificarAccesoBarberia";
import { crearEstadoAcceso } from "@/lib/estado-acceso";

import { SidebarAdmin } from "@/components/SidebarAdmin";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const membresia = session.user.membresias.find(
    (m) =>
      m.barberiaSlug === params.slug &&
      m.rol === "DUENO"
  );

  if (!membresia) {
    redirect("/panel");
  }

  const acceso = await verificarAccesoBarberia(
    params.slug
  );

  if (!acceso.barberia) {
    redirect("/panel");
  }

  const estadoAcceso = crearEstadoAcceso(acceso);

  return (
    <div className="min-h-screen bg-brand-50 overflow-x-hidden lg:flex">
      <SidebarAdmin
        slug={params.slug}
        nombreBarberia={acceso.barberia.nombre}
        logoUrl={acceso.barberia.logoUrl}
        estadoAcceso={estadoAcceso}
      />

      <main className="flex-1 p-4 lg:p-6 min-w-0 max-w-full">
        {acceso.mensaje && (
          <div className="mb-4 rounded-md bg-warning-50 px-4 py-3 text-sm text-warning-700">
            {acceso.mensaje}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}