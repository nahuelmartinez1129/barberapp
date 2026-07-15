import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChecklistOnboarding } from "@/components/onboarding/ChecklistOnboarding";

export default async function Bienvenida({
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
      miembros: true,
      servicios: true,
      horarios: true,
    },
  });

  if (!barberia) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto py-12">

      <ChecklistOnboarding
        barberia={barberia}
      />

    </div>
  );
}