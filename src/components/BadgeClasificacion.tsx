import type { ClasificacionCliente } from "@/lib/clientes";

const ESTILOS: Record<ClasificacionCliente, string> = {
  NUEVO: "bg-accent-50 text-accent-700",
  FRECUENTE: "bg-success-50 text-success-700",
  VIP: "bg-warning-50 text-warning-700",
};

const ETIQUETAS: Record<ClasificacionCliente, string> = {
  NUEVO: "Cliente nuevo",
  FRECUENTE: "Cliente frecuente",
  VIP: "Cliente VIP",
};

export function BadgeClasificacion({
  clasificacion,
}: {
  clasificacion: ClasificacionCliente;
}) {
  return (
    <span className={`badge whitespace-nowrap ${ESTILOS[clasificacion]}`}>
      {ETIQUETAS[clasificacion]}
    </span>
  );
}
