import { Module, forwardRef } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { InvoiceController } from "./invoice.controller";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { ServiceOrderModule } from "../service-order/service-order.module";

@Module({
  imports: [PrismaModule, ServiceOrderModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
