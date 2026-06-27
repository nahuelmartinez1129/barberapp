"use client";

import { useRouter } from "next/navigation";
import { guardarHorarioBarbero } from "@/lib/actions/horarioBarbero";
import { type DiaHorario } from "@/lib/diasSemana";
import { EditorHorarioSemanal } from "@/components/EditorHorarioSemanal";

export function FormularioHorarioBarbero({
  barberoId,
  horarioInicial,
}: {
  barberoId: string;
  horarioInicial: DiaHorario[];
}) {
  const router = useRouter();

  async function manejarGuardar(dias: DiaHorario[]) {
    await guardarHorarioBarbero({ barberoId, dias });
    router.refresh();
  }

  return (
    <EditorHorarioSemanal
      // key fuerza a recrear el formulario (y su estado interno) cuando
      // cambia el barbero seleccionado, para que no arrastre el horario
      // del barbero anterior.
      key={barberoId}
      titulo="Horario semanal"
      horarioInicial={horarioInicial}
      onGuardar={manejarGuardar}
    />
  );
}
