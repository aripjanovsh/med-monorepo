/*
  Warnings:

  - The values [ADMIN,DOCTOR,NURSE,RECEPTIONIST,PATIENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `employee_service_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_types` table. If the table is not empty, all the data it contains will be lost.

*/

-- AlterEnum: Create new enum with both old and new values first
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'USER');

-- Update users: Convert old roles to USER before switching enum
-- First, alter column to text temporarily
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;

-- Update all non-SUPER_ADMIN users to USER
UPDATE "users" 
SET role = 'USER' 
WHERE role != 'SUPER_ADMIN';

-- Now convert to new enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::"UserRole_new");

-- Swap enums
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";

-- DropForeignKey
ALTER TABLE "employee_service_types" DROP CONSTRAINT "employee_service_types_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "employee_service_types" DROP CONSTRAINT "employee_service_types_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "service_types" DROP CONSTRAINT "service_types_organizationId_fkey";

-- DropTable
DROP TABLE "employee_service_types";

-- DropTable
DROP TABLE "service_types";
