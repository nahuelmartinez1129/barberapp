"use client";

import { useRouter } from "next/navigation";
import { guardarHorarioBarberia } from "@/lib/actions/horarios";
import { EditorHorarioSemanal } from "@/components/EditorHorarioSemanal";
import { type DiaHorarioBarberia } from "@/lib/horarioBarberia";

export function FormularioHorarios({
  barberiaId,
  horarioInicial,
}: {
  barberiaId: string;
  horarioInicial: DiaHorarioBarberia[];
}) {
  const router = useRouter();

  async function manejarGuardar(dias: DiaHorarioBarberia[]) {
    await guardarHorarioBarberia({
      barberiaId,
      dias,
    });

    router.refresh();
  }

  return (
    <div className="card">
      <EditorHorarioSemanal
        titulo="Horarios de atención"
        horarioInicial={horarioInicial}
        onGuardar={manejarGuardar}
      />
    </div>
  );
}