import { redirect } from "next/navigation";

export default function PaginaCliente({
  params,
}: {
  params: { slug: string };
}) {
  // El cliente no tiene un dashboard propio: su "panel" es la pagina
  // publica de reserva de la barberia a la que pertenece.
  redirect(`/reservar/${params.slug}`);
}
