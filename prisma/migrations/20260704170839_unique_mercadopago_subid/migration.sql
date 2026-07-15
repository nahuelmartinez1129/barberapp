/*
  Warnings:

  - A unique constraint covering the columns `[mercadopagoSubId]` on the table `suscripciones` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_mercadopagoSubId_key" ON "suscripciones"("mercadopagoSubId");
