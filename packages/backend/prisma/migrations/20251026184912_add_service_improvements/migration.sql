/*
  Warnings:

  - You are about to drop the column `duration` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,organizationId]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceTypeEnum" AS ENUM ('CONSULTATION', 'LAB', 'DIAGNOSTIC', 'PROCEDURE', 'OTHER');

-- AlterTable
ALTER TABLE "services" DROP COLUMN "duration",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "type" "ServiceTypeEnum" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "services_code_organizationId_key" ON "services"("code", "organizationId");
