import { Module } from "@nestjs/common";
import { ServiceOrderService } from "./service-order.service";
import { ServiceOrderController } from "./service-order.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService],
})
export class ServiceOrderModule {}
