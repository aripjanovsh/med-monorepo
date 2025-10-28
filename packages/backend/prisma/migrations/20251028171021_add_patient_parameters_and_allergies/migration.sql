-- CreateEnum
CREATE TYPE "ParameterSource" AS ENUM ('MANUAL', 'LAB', 'DEVICE', 'IMPORT');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE');

-- CreateTable
CREATE TABLE "parameter_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "valueType" "ParameterType" NOT NULL,
    "defaultUnit" TEXT,
    "normalRange" JSONB,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parameter_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_parameters" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "serviceOrderId" TEXT,
    "parameterCode" TEXT NOT NULL,
    "valueNumeric" DECIMAL(12,4),
    "valueText" TEXT,
    "valueBoolean" BOOLEAN,
    "valueJson" JSONB,
    "unit" TEXT,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    "source" "ParameterSource" NOT NULL DEFAULT 'MANUAL',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "recordedById" TEXT NOT NULL,
    "substance" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "AllergySeverity",
    "note" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parameter_definitions_organizationId_idx" ON "parameter_definitions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_definitions_code_organizationId_key" ON "parameter_definitions"("code", "organizationId");

-- CreateIndex
CREATE INDEX "patient_parameters_patientId_parameterCode_measuredAt_idx" ON "patient_parameters"("patientId", "parameterCode", "measuredAt");

-- CreateIndex
CREATE INDEX "patient_parameters_visitId_idx" ON "patient_parameters"("visitId");

-- CreateIndex
CREATE INDEX "patient_parameters_serviceOrderId_idx" ON "patient_parameters"("serviceOrderId");

-- CreateIndex
CREATE INDEX "patient_parameters_organizationId_idx" ON "patient_parameters"("organizationId");

-- CreateIndex
CREATE INDEX "allergies_patientId_idx" ON "allergies"("patientId");

-- CreateIndex
CREATE INDEX "allergies_visitId_idx" ON "allergies"("visitId");

-- CreateIndex
CREATE INDEX "allergies_organizationId_idx" ON "allergies"("organizationId");

-- AddForeignKey
ALTER TABLE "parameter_definitions" ADD CONSTRAINT "parameter_definitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_parameters" ADD CONSTRAINT "patient_parameters_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_parameters" ADD CONSTRAINT "patient_parameters_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_parameters" ADD CONSTRAINT "patient_parameters_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "service_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_parameters" ADD CONSTRAINT "patient_parameters_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_parameters" ADD CONSTRAINT "patient_parameters_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
