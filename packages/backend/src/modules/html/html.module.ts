import { Module } from "@nestjs/common";
import { HtmlController } from "./html.controller";
import { HtmlService } from "./html.service";
import { InvoiceModule } from "../invoice/invoice.module";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [InvoiceModule, PrismaModule],
  controllers: [HtmlController],
  providers: [HtmlService],
})
export class HtmlModule {}
