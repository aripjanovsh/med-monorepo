-- DropForeignKey
ALTER TABLE "service_orders" DROP CONSTRAINT "service_orders_doctorId_fkey";

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
