/*
  Warnings:

  - You are about to drop the column `workSchedule` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "workSchedule";

-- CreateTable
CREATE TABLE "employee_availability" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "until" DATE,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "repeatOn" INTEGER[],
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "employee_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leave_days" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "until" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "employee_leave_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "color" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "until" DATE NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_availability_employeeId_idx" ON "employee_availability"("employeeId");

-- CreateIndex
CREATE INDEX "employee_availability_organizationId_idx" ON "employee_availability"("organizationId");

-- CreateIndex
CREATE INDEX "employee_availability_startsOn_until_idx" ON "employee_availability"("startsOn", "until");

-- CreateIndex
CREATE INDEX "employee_leave_days_employeeId_idx" ON "employee_leave_days"("employeeId");

-- CreateIndex
CREATE INDEX "employee_leave_days_leaveTypeId_idx" ON "employee_leave_days"("leaveTypeId");

-- CreateIndex
CREATE INDEX "employee_leave_days_organizationId_idx" ON "employee_leave_days"("organizationId");

-- CreateIndex
CREATE INDEX "employee_leave_days_startsOn_until_idx" ON "employee_leave_days"("startsOn", "until");

-- CreateIndex
CREATE INDEX "leave_types_organizationId_idx" ON "leave_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_organizationId_key" ON "leave_types"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_organizationId_key" ON "leave_types"("code", "organizationId");

-- CreateIndex
CREATE INDEX "holidays_organizationId_idx" ON "holidays"("organizationId");

-- CreateIndex
CREATE INDEX "holidays_startsOn_until_idx" ON "holidays"("startsOn", "until");

-- AddForeignKey
ALTER TABLE "employee_availability" ADD CONSTRAINT "employee_availability_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leave_days" ADD CONSTRAINT "employee_leave_days_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leave_days" ADD CONSTRAINT "employee_leave_days_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
