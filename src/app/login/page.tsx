import LoginForm from "@/components/login/LoginForm";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const membresias = (session.user as any).membresias;

    if (membresias?.length > 0) {
      redirect(`/admin/${membresias[0].barberiaSlug}`);
    }

    redirect("/panel");
  }

  return <LoginForm />;
}