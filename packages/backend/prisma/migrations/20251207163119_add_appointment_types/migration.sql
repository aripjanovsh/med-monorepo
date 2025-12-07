-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "appointmentCancelTypeId" TEXT,
ADD COLUMN     "appointmentTypeId" TEXT;

-- CreateTable
CREATE TABLE "appointment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "color" TEXT,
    "durationMin" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_cancel_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "appointment_cancel_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_types_organizationId_idx" ON "appointment_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_types_name_organizationId_key" ON "appointment_types"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_types_code_organizationId_key" ON "appointment_types"("code", "organizationId");

-- CreateIndex
CREATE INDEX "appointment_cancel_types_organizationId_idx" ON "appointment_cancel_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_cancel_types_name_organizationId_key" ON "appointment_cancel_types"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_cancel_types_code_organizationId_key" ON "appointment_cancel_types"("code", "organizationId");

-- CreateIndex
CREATE INDEX "appointments_appointmentTypeId_idx" ON "appointments"("appointmentTypeId");

-- CreateIndex
CREATE INDEX "appointments_appointmentCancelTypeId_idx" ON "appointments"("appointmentCancelTypeId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "appointment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointmentCancelTypeId_fkey" FOREIGN KEY ("appointmentCancelTypeId") REFERENCES "appointment_cancel_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_types" ADD CONSTRAINT "appointment_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_cancel_types" ADD CONSTRAINT "appointment_cancel_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
