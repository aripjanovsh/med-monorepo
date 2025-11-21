import { Controller, Get, Param, Render } from "@nestjs/common";
import { HtmlService } from "./html.service";

@Controller("html")
export class HtmlController {
  constructor(private readonly htmlService: HtmlService) {}

  @Get("invoice/:invoiceId")
  @Render("invoice")
  async getInvoice(@Param("invoiceId") invoiceId: string) {
    return this.htmlService.getInvoiceData(invoiceId);
  }
}
