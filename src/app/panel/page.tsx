import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PanelRedirect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const membresias = session.user.membresias;

  if (!membresias || membresias.length === 0) {
    redirect("/login?error=sin-barberia");
  }

  // Si el usuario tiene una sola membresia, va directo a ese panel.
  // Los clientes finales ya no tienen membresia/sesion (ver modelo
  // Cliente): NextAuth ahora es exclusivo de DUENO y BARBERO.
  if (membresias.length === 1) {
    const m = membresias[0];
    if (m.rol === "DUENO") redirect(`/admin/${m.barberiaSlug}`);
    if (m.rol === "BARBERO") redirect(`/barbero/${m.barberiaSlug}`);
  }

  redirect("/panel/seleccionar");
}
