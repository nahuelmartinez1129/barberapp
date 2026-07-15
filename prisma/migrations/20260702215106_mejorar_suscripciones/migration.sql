-- CreateEnum
CREATE TYPE "RolGlobal" AS ENUM ('SUPER_ADMIN', 'USUARIO');

-- CreateEnum
CREATE TYPE "RolBarberia" AS ENUM ('DUENO', 'BARBERO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "PlanSuscripcion" AS ENUM ('BASICO', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'VENCIDA', 'CANCELADA', 'PRUEBA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "barberias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "logoUrl" TEXT,
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    "horariosConfigurados" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barberias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT,
    "rolGlobal" "RolGlobal" NOT NULL DEFAULT 'USUARIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros_barberia" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rol" "RolBarberia" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "colorAgenda" TEXT DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "miembros_barberia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbero_servicios" (
    "id" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,

    CONSTRAINT "barbero_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "precioCobrado" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueos_horario" (
    "id" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bloqueos_horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_atencion" (
    "id" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "horarios_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_barberia" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "horarios_barberia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones" (
    "id" TEXT NOT NULL,
    "barberiaId" TEXT NOT NULL,
    "plan" "PlanSuscripcion" NOT NULL DEFAULT 'BASICO',
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'PRUEBA',
    "precioMensual" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaProximoPago" TIMESTAMP(3) NOT NULL,
    "cancelarAlFinalDelPeriodo" BOOLEAN NOT NULL DEFAULT false,
    "mercadopagoSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_suscripcion" (
    "id" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "estado" "EstadoPago" NOT NULL,
    "mercadopagoId" TEXT,
    "descripcion" TEXT,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barberias_slug_key" ON "barberias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_barberia_barberiaId_usuarioId_key" ON "miembros_barberia"("barberiaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "barbero_servicios_barberoId_servicioId_key" ON "barbero_servicios"("barberoId", "servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_barberiaId_telefono_key" ON "clientes"("barberiaId", "telefono");

-- CreateIndex
CREATE INDEX "turnos_barberiaId_fecha_idx" ON "turnos"("barberiaId", "fecha");

-- CreateIndex
CREATE INDEX "turnos_barberoId_fecha_idx" ON "turnos"("barberoId", "fecha");

-- CreateIndex
CREATE INDEX "bloqueos_horario_barberoId_fecha_idx" ON "bloqueos_horario"("barberoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_atencion_barberoId_diaSemana_key" ON "horarios_atencion"("barberoId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_barberia_barberiaId_diaSemana_key" ON "horarios_barberia"("barberiaId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_barberiaId_key" ON "suscripciones"("barberiaId");

-- CreateIndex
CREATE INDEX "pagos_suscripcion_suscripcionId_idx" ON "pagos_suscripcion"("suscripcionId");

-- AddForeignKey
ALTER TABLE "miembros_barberia" ADD CONSTRAINT "miembros_barberia_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_barberia" ADD CONSTRAINT "miembros_barberia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbero_servicios" ADD CONSTRAINT "barbero_servicios_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "miembros_barberia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbero_servicios" ADD CONSTRAINT "barbero_servicios_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "miembros_barberia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_barberia" ADD CONSTRAINT "horarios_barberia_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_barberiaId_fkey" FOREIGN KEY ("barberiaId") REFERENCES "barberias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_suscripcion" ADD CONSTRAINT "pagos_suscripcion_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "suscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
