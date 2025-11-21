import { Module } from "@nestjs/common";
import { PdfController } from "./pdf.controller";
import { PdfService } from "./pdf.service";
import { HtmlModule } from "../html/html.module";

@Module({
  imports: [HtmlModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService], // Экспортируем для использования в других модулях
})
export class PdfModule {}
