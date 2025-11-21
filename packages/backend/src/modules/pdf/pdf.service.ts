import { Injectable } from "@nestjs/common";
import { HtmlService } from "../html/html.service";
import puppeteer from "puppeteer";

@Injectable()
export class PdfService {
  constructor(private readonly htmlService: HtmlService) {}

  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    // Получаем HTML из существующего шаблона
    const html = await this.htmlService.renderInvoice(invoiceId);

    // Запускаем браузер
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Устанавливаем контент
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Генерируем PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "5mm",
          right: "5mm",
          bottom: "5mm",
          left: "5mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Получить PDF buffer для отправки по email, Telegram и т.д.
   * @param invoiceId ID счета
   * @returns PDF buffer и имя файла
   */
  async getInvoicePdfBuffer(
    invoiceId: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    const buffer = await this.generateInvoicePdf(invoiceId);
    const data = await this.htmlService.getInvoiceData(invoiceId);

    return {
      buffer,
      filename: `invoice-${data.invoice.invoiceNumber}.pdf`,
    };
  }

  /**
   * Генерация PDF для service order (результаты анализов)
   */
  async generateServiceOrderPdf(serviceOrderId: string): Promise<Buffer> {
    // Получаем HTML из существующего шаблона
    const html = await this.htmlService.renderServiceOrder(serviceOrderId);

    // Запускаем браузер
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Устанавливаем контент
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Генерируем PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "5mm",
          right: "5mm",
          bottom: "5mm",
          left: "5mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Получить PDF buffer для service order
   * @param serviceOrderId ID заказа услуги
   * @returns PDF buffer и имя файла
   */
  async getServiceOrderPdfBuffer(
    serviceOrderId: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    const buffer = await this.generateServiceOrderPdf(serviceOrderId);
    const data = await this.htmlService.getServiceOrderData(serviceOrderId);

    return {
      buffer,
      filename: `service-order-${data.serviceOrder.service.name.replace(/[^a-zа-яё0-9]/gi, "-")}-${serviceOrderId.slice(0, 8)}.pdf`,
    };
  }
}
