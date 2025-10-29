/*
  Warnings:

  - The values [LAB_ORDER] on the enum `RecordType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `lab_orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecordType_new" AS ENUM ('COMPLAINTS', 'EXAMINATION', 'DIAGNOSIS', 'PRESCRIPTION', 'NOTE');
ALTER TABLE "medical_records" ALTER COLUMN "type" TYPE "RecordType_new" USING ("type"::text::"RecordType_new");
ALTER TYPE "RecordType" RENAME TO "RecordType_old";
ALTER TYPE "RecordType_new" RENAME TO "RecordType";
DROP TYPE "RecordType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "lab_orders" DROP CONSTRAINT "lab_orders_createdById_fkey";

-- DropForeignKey
ALTER TABLE "lab_orders" DROP CONSTRAINT "lab_orders_visitId_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledById" TEXT,
ADD COLUMN     "checkInAt" TIMESTAMP(3),
ADD COLUMN     "checkOutAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "roomNumber" TEXT;

-- DropTable
DROP TABLE "lab_orders";

-- DropEnum
DROP TYPE "LabStatus";

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
