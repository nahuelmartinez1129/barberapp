type Props = {
  barberia: any;
};

export function ChecklistOnboarding({
  barberia,
}: Props) {

  const tieneBarberos =
    barberia.miembros.filter(
      (m:any)=>m.rol==="BARBERO"
    ).length > 0;

  const tieneServicios =
    barberia.servicios.length > 0;

  const horariosConfigurados =
    barberia.horarios.some(
      (h:any)=>h.activo
    );

  const tareas = [

    {
      titulo:"Cuenta creada",
      completa:true,
    },

    {
      titulo:"Barbería creada",
      completa:true,
    },

    {
      titulo:"Agregar primer barbero",
      completa:tieneBarberos,
    },

    {
      titulo:"Crear primer servicio",
      completa:tieneServicios,
    },

    {
      titulo:"Configurar horarios",
      completa:horariosConfigurados,
    },

    {
      titulo:"Compartir página de reservas",
      completa:false,
    },

  ];

  const progreso =
    tareas.filter(t=>t.completa).length;

  return (

    <div className="card p-10">

      <span className="text-sm text-accent-600 font-medium">

        Bienvenido a BarberApp

      </span>

      <h1 className="text-4xl font-semibold mt-2 text-brand-900">

        Tu barbería ya está creada.

      </h1>

      <p className="mt-3 text-brand-500">

        Vamos a ayudarte a dejar todo listo para que empieces a recibir reservas.

      </p>

      <div className="mt-8">

        <div className="flex justify-between mb-2">

          <span className="text-sm">

            Progreso

          </span>

          <span className="text-sm">

            {progreso}/6

          </span>

        </div>

        <div className="h-3 rounded-full bg-brand-100">

          <div
            className="h-3 rounded-full bg-accent-500 transition-all"
            style={{
              width:`${(progreso/6)*100}%`
            }}
          />

        </div>

      </div>

      <div className="space-y-3 mt-10">

        {tareas.map((t)=>(
          <div
            key={t.titulo}
            className="flex items-center justify-between border rounded-xl px-5 py-4"
          >

            <span>

              {t.titulo}

            </span>

            <span
              className={
                t.completa
                  ? "text-green-600"
                  : "text-brand-400"
              }
            >

              {t.completa ? "Completo" : "Pendiente"}

            </span>

          </div>
        ))}

      </div>

    </div>

  );

}