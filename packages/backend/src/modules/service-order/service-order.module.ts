import { Module } from "@nestjs/common";
import { ServiceOrderService } from "./service-order.service";
import { ServiceOrderQueueService } from "./service-order-queue.service";
import { ServiceOrderPdfService } from "./service-order-pdf.service";
import { ServiceOrderController } from "./service-order.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService, ServiceOrderQueueService, ServiceOrderPdfService],
  exports: [ServiceOrderService, ServiceOrderQueueService, ServiceOrderPdfService],
})
export class ServiceOrderModule {}
