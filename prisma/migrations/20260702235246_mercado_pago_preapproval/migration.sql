-- AlterTable
ALTER TABLE "suscripciones" ADD COLUMN     "checkoutUrl" TEXT,
ADD COLUMN     "fechaUltimaSincronizacion" TIMESTAMP(3),
ADD COLUMN     "ultimaRespuestaMP" JSONB;
