/*
  Warnings:

  - You are about to drop the `patient_contacts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "patient_contacts" DROP CONSTRAINT "patient_contacts_patientId_fkey";

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "secondaryPhone" TEXT;

-- DropTable
DROP TABLE "patient_contacts";

-- DropEnum
DROP TYPE "ContactRelationType";

-- DropEnum
DROP TYPE "ContactType";
