import { Module } from "@nestjs/common";
import { LabOrderService } from "./lab-order.service";
import { LabOrderController } from "./lab-order.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [LabOrderController],
  providers: [LabOrderService],
  exports: [LabOrderService],
})
export class LabOrderModule {}
