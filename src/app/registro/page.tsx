import { RegistroWizard } from "@/components/registro/RegistroWizard";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegistroPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const membresias = (session.user as any).membresias;

    if (membresias?.length > 0) {
      redirect(`/admin/${membresias[0].barberiaSlug}`);
    }

    redirect("/panel");
  }

  return (
    <main className="min-h-screen bg-brand-50 flex items-center justify-center px-6 py-16">
      <RegistroWizard />
    </main>
  );
}