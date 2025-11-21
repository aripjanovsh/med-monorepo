import { Controller, Get, Param, Res, Header } from "@nestjs/common";
import type { Response } from "express";
import { PdfService } from "./pdf.service";

@Controller("pdf")
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get("invoice/:invoiceId")
  @Header("Content-Type", "application/pdf")
  async getInvoicePdf(
    @Param("invoiceId") invoiceId: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="invoice-${invoiceId}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
  }

  @Get("invoice/:invoiceId/download")
  @Header("Content-Type", "application/pdf")
  async downloadInvoicePdf(
    @Param("invoiceId") invoiceId: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoiceId}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
  }

  @Get("service-order/:serviceOrderId")
  @Header("Content-Type", "application/pdf")
  async getServiceOrderPdf(
    @Param("serviceOrderId") serviceOrderId: string,
    @Res() res: Response
  ) {
    const { buffer, filename } =
      await this.pdfService.getServiceOrderPdfBuffer(serviceOrderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    res.end(buffer);
  }

  @Get("service-order/:serviceOrderId/download")
  @Header("Content-Type", "application/pdf")
  async downloadServiceOrderPdf(
    @Param("serviceOrderId") serviceOrderId: string,
    @Res() res: Response
  ) {
    const { buffer, filename } =
      await this.pdfService.getServiceOrderPdfBuffer(serviceOrderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    res.end(buffer);
  }
}
