-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('HOURLY', 'SALARY', 'PART_TIME', 'FULL_TIME');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "availableHours" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "customTitle" TEXT,
ADD COLUMN     "employeeType" "EmployeeType",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "groups" TEXT,
ADD COLUMN     "hourlyHours" INTEGER,
ADD COLUMN     "primaryLanguage" TEXT,
ADD COLUMN     "profitCenter" TEXT,
ADD COLUMN     "pto" INTEGER,
ADD COLUMN     "secondaryLanguage" TEXT,
ADD COLUMN     "secondaryPhone" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "supervisorId" TEXT,
ADD COLUMN     "targetedHours" INTEGER,
ADD COLUMN     "textNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "titleId" TEXT,
ADD COLUMN     "workPhone" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "employee_service_types" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,

    CONSTRAINT "employee_service_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_service_types_employeeId_serviceTypeId_key" ON "employee_service_types"("employeeId", "serviceTypeId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_service_types" ADD CONSTRAINT "employee_service_types_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_service_types" ADD CONSTRAINT "employee_service_types_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
