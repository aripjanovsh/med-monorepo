-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "service_orders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT,
    "doctorId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "departmentId" TEXT,
    "protocolTemplateId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'ORDERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "resultText" TEXT,
    "resultData" JSONB,
    "resultFileUrl" TEXT,
    "resultAt" TIMESTAMP(3),
    "performedById" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_orders_patientId_idx" ON "service_orders"("patientId");

-- CreateIndex
CREATE INDEX "service_orders_visitId_idx" ON "service_orders"("visitId");

-- CreateIndex
CREATE INDEX "service_orders_doctorId_idx" ON "service_orders"("doctorId");

-- CreateIndex
CREATE INDEX "service_orders_serviceId_idx" ON "service_orders"("serviceId");

-- CreateIndex
CREATE INDEX "service_orders_departmentId_idx" ON "service_orders"("departmentId");

-- CreateIndex
CREATE INDEX "service_orders_status_idx" ON "service_orders"("status");

-- CreateIndex
CREATE INDEX "service_orders_paymentStatus_idx" ON "service_orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "service_orders_organizationId_idx" ON "service_orders"("organizationId");

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_protocolTemplateId_fkey" FOREIGN KEY ("protocolTemplateId") REFERENCES "protocol_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
