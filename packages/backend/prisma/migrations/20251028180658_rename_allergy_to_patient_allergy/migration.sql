-- Rename table from allergies to patient_allergies
ALTER TABLE "allergies" RENAME TO "patient_allergies";

-- Rename constraints
ALTER TABLE "patient_allergies" RENAME CONSTRAINT "allergies_pkey" TO "patient_allergies_pkey";
ALTER TABLE "patient_allergies" RENAME CONSTRAINT "allergies_organizationId_fkey" TO "patient_allergies_organizationId_fkey";
ALTER TABLE "patient_allergies" RENAME CONSTRAINT "allergies_patientId_fkey" TO "patient_allergies_patientId_fkey";
ALTER TABLE "patient_allergies" RENAME CONSTRAINT "allergies_recordedById_fkey" TO "patient_allergies_recordedById_fkey";
ALTER TABLE "patient_allergies" RENAME CONSTRAINT "allergies_visitId_fkey" TO "patient_allergies_visitId_fkey";

-- Rename indexes
ALTER INDEX "allergies_patientId_idx" RENAME TO "patient_allergies_patientId_idx";
ALTER INDEX "allergies_visitId_idx" RENAME TO "patient_allergies_visitId_idx";
ALTER INDEX "allergies_organizationId_idx" RENAME TO "patient_allergies_organizationId_idx";
