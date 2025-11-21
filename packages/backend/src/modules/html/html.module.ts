import { Module } from "@nestjs/common";
import { HtmlController } from "./html.controller";
import { HtmlService } from "./html.service";
import { InvoiceModule } from "../invoice/invoice.module";
import { ServiceOrderModule } from "../service-order/service-order.module";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule, InvoiceModule, ServiceOrderModule],
  controllers: [HtmlController],
  providers: [HtmlService],
  exports: [HtmlService],
})
export class HtmlModule {}
