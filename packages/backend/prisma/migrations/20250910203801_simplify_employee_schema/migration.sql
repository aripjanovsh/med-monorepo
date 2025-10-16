/*
  Warnings:

  - The values [OTHER,PREFER_NOT_TO_SAY] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `addressLine1` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `availableHours` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `consultationFee` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `customTitle` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `employeeType` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `groups` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyHours` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `profitCenter` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `pto` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `targetedHours` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `employees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId,organizationId]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "employees" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_supervisorId_fkey";

-- DropIndex
DROP INDEX "employees_employeeId_key";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "availableHours",
DROP COLUMN "bio",
DROP COLUMN "certifications",
DROP COLUMN "city",
DROP COLUMN "consultationFee",
DROP COLUMN "customTitle",
DROP COLUMN "department",
DROP COLUMN "education",
DROP COLUMN "emergencyContact",
DROP COLUMN "employeeType",
DROP COLUMN "experience",
DROP COLUMN "groups",
DROP COLUMN "hourlyHours",
DROP COLUMN "licenseNumber",
DROP COLUMN "position",
DROP COLUMN "profitCenter",
DROP COLUMN "pto",
DROP COLUMN "skills",
DROP COLUMN "specialization",
DROP COLUMN "state",
DROP COLUMN "supervisorId",
DROP COLUMN "targetedHours",
DROP COLUMN "zipCode";

-- DropEnum
DROP TYPE "EmployeeType";

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeId_organizationId_key" ON "employees"("employeeId", "organizationId");
