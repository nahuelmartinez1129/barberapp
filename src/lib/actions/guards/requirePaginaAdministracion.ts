import { verificarAcceso } from "@/lib/actions/verificarAcceso";

export async function requirePaginaAdministracion(
  barberiaId: string
) {
  return verificarAcceso(barberiaId);
}