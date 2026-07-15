import { verificarAcceso } from "../verificarAcceso";

export async function requireSuscripcionActiva(
  barberiaId: string
) {
  const acceso =
    await verificarAcceso(barberiaId);

  if (!acceso.permitida) {
    throw new Error(
      acceso.mensaje ??
        "La suscripción no permite realizar esta acción."
    );
  }

  return acceso;
}