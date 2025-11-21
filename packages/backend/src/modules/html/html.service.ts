import { Injectable } from "@nestjs/common";
import { InvoiceService } from "../invoice/invoice.service";
import { ServiceOrderService } from "../service-order/service-order.service";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { readFile } from "fs/promises";
import { join } from "path";
import Handlebars from "handlebars";

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("ne", (a, b) => a !== b);

@Injectable()
export class HtmlService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly prisma: PrismaService
  ) {}

  async getInvoiceData(invoiceId: string) {
    const invoice = await this.invoiceService.findOne(invoiceId);

    const organization = await this.prisma.organization.findUnique({
      where: { id: invoice.organizationId },
    });

    const currencyFormatter = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "UZS",
      maximumFractionDigits: 0,
    });

    const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formatCurrency = (value?: unknown) =>
      currencyFormatter.format(Number(value ?? 0));

    const statusLabels: Record<PaymentStatus, string> = {
      [PaymentStatus.UNPAID]: "Не оплачено",
      [PaymentStatus.PARTIALLY_PAID]: "Оплачено частично",
      [PaymentStatus.PAID]: "Оплачено",
      [PaymentStatus.REFUNDED]: "Возврат средств",
    };

    const statusBadgeClasses: Record<PaymentStatus, string> = {
      [PaymentStatus.PAID]: "badge badge-success",
      [PaymentStatus.UNPAID]: "badge badge-error",
      [PaymentStatus.PARTIALLY_PAID]: "badge badge-warning",
      [PaymentStatus.REFUNDED]: "badge badge-info",
    };

    // Calculate totals if needed or format dates
    const formattedItems = invoice.items.map((item) => ({
      ...item,
      totalPrice: formatCurrency(item.totalPrice),
      unitPrice: formatCurrency(item.unitPrice),
      discount: formatCurrency(item.discount ?? 0),
    }));

    const formattedPayments = invoice.payments.map((payment) => ({
      ...payment,
      amount: formatCurrency(payment.amount),
      paidAtFormatted: payment.paidAt
        ? dateTimeFormatter.format(payment.paidAt)
        : "",
    }));

    const totalAmount = Number(invoice.totalAmount);
    const paidAmount = Number(invoice.paidAmount);
    const remainingAmount = (totalAmount - paidAmount).toFixed(2);

    const visit = invoice.visit
      ? {
          ...invoice.visit,
          visitDateFormatted: dateFormatter.format(invoice.visit.visitDate),
        }
      : null;

    return {
      organization,
      invoice: {
        ...invoice,
        visit,
        totalAmount: formatCurrency(totalAmount),
        paidAmount: formatCurrency(paidAmount),
        remainingAmount: formatCurrency(Number(remainingAmount)),
        createdAt: dateFormatter.format(invoice.createdAt),
        dueDate: invoice.dueDate ? dateFormatter.format(invoice.dueDate) : null,
        statusLabel: statusLabels[invoice.status] ?? invoice.status,
        statusBadgeClass:
          statusBadgeClasses[invoice.status] ?? "badge badge-primary",
        items: formattedItems,
        payments: formattedPayments,
      },
    };
  }

  /**
   * Render invoice template to HTML string for PDF generation
   */
  async renderInvoice(invoiceId: string): Promise<string> {
    // Получаем данные для шаблона
    const data = await this.getInvoiceData(invoiceId);

    // Читаем шаблон (из dist папки после компиляции)
    const templatePath = join(
      __dirname,
      "..",
      "..",
      "..",
      "modules",
      "html",
      "templates",
      "invoice.hbs"
    );
    const templateContent = await readFile(templatePath, "utf-8");

    // Компилируем и рендерим
    const template = Handlebars.compile(templateContent);
    const html = template(data);

    // Добавляем inline стили для PDF
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            ${await this.getInvoiceStyles()}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  /**
   * Get CSS styles for invoice
   */
  private async getInvoiceStyles(): Promise<string> {
    // CSS находится в dist/public/html/styles.css
    const stylesPath = join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "html",
      "styles.css"
    );
    return await readFile(stylesPath, "utf-8");
  }

  /**
   * Parse protocol template to get field labels
   */
  private parseProtocolTemplate(templateContent: string): Map<string, string> {
    const fieldLabels = new Map<string, string>();

    try {
      const template = JSON.parse(templateContent);
      if (template.sections && Array.isArray(template.sections)) {
        for (const section of template.sections) {
          if (section.fields && Array.isArray(section.fields)) {
            for (const field of section.fields) {
              if (field.id && field.label) {
                fieldLabels.set(field.id, field.label);
              }
            }
          }
        }
      }
    } catch (error) {
      // If parsing fails, return empty map
    }

    return fieldLabels;
  }

  /**
   * Determine reference range category based on patient data
   */
  private getReferenceCategory(
    patient: any
  ): "men" | "women" | "children" | null {
    if (!patient) return null;

    // Calculate age from dateOfBirth
    const dateOfBirth = (patient as any).dateOfBirth;
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      const adjustedAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      // Children: under 18 years
      if (adjustedAge < 18) {
        return "children";
      }
    }

    // Adults: check gender
    const gender = patient.gender;
    if (gender === "MALE") return "men";
    if (gender === "FEMALE") return "women";

    return null;
  }

  /**
   * Check if value is within reference range
   */
  private checkReferenceRange(
    value: any,
    referenceRanges: any,
    category: "men" | "women" | "children" | null
  ): {
    status: "normal" | "abnormal" | "unknown";
    range: string | null;
  } {
    if (!referenceRanges || !category) {
      return { status: "unknown", range: null };
    }

    const range = referenceRanges[category];
    if (!range) {
      return { status: "unknown", range: null };
    }

    // Format range display
    const rangeText =
      range.min !== undefined && range.max !== undefined
        ? `${range.min}–${range.max}`
        : range.min !== undefined
          ? `≥ ${range.min}`
          : range.max !== undefined
            ? `≤ ${range.max}`
            : null;

    // Parse numeric value
    const numericValue = parseFloat(String(value).replace(/[^\d.-]/g, ""));
    if (isNaN(numericValue)) {
      return { status: "unknown", range: rangeText };
    }

    // Check if within range
    const isNormal =
      (range.min === undefined || numericValue >= range.min) &&
      (range.max === undefined || numericValue <= range.max);

    return {
      status: isNormal ? "normal" : "abnormal",
      range: rangeText,
    };
  }

  /**
   * Parse resultData to determine type and extract data
   */
  private parseResultData(
    resultData: any,
    patient?: any
  ): {
    resultType: "text" | "analysis" | "protocol" | null;
    analysisData: any | null;
    protocolData: any | null;
  } {
    if (!resultData) {
      return { resultType: null, analysisData: null, protocolData: null };
    }

    // Check for SavedAnalysisData (has rows in filledData)
    if (
      "filledData" in resultData &&
      "templateContent" in resultData &&
      "rows" in resultData.filledData
    ) {
      // Determine reference category for patient
      const refCategory = this.getReferenceCategory(patient);

      // Enrich rows with reference range check
      const enrichedRows = resultData.filledData.rows.map((row: any) => {
        const { status, range } = this.checkReferenceRange(
          row.value,
          row.referenceRanges,
          refCategory
        );

        return {
          ...row,
          normalRange: range || row.normalRange || "—",
          status,
        };
      });

      return {
        resultType: "analysis",
        analysisData: {
          ...resultData,
          filledData: {
            ...resultData.filledData,
            rows: enrichedRows,
          },
        },
        protocolData: null,
      };
    }

    // Check for SavedProtocolData (has filledData but no rows)
    if (
      "filledData" in resultData &&
      "templateContent" in resultData &&
      !("rows" in resultData.filledData)
    ) {
      // Parse template to get field labels
      const fieldLabels = this.parseProtocolTemplate(
        resultData.templateContent
      );

      // Transform filledData to include labels and format values
      const fieldsWithLabels = Object.entries(resultData.filledData)
        .map(([key, value]) => {
          // Format value based on type
          let formattedValue = value;
          if (Array.isArray(value)) {
            // For arrays (tags), join with commas
            formattedValue = value.join(", ");
          } else if (typeof value === "boolean") {
            // For booleans
            formattedValue = value ? "Да" : "Нет";
          } else if (value === null || value === undefined) {
            // For empty values
            formattedValue = "—";
          }

          return {
            id: key,
            label: fieldLabels.get(key) || key,
            value: formattedValue,
          };
        })
        .filter((field) => field.value !== "" && field.value !== "—"); // Hide empty fields

      return {
        resultType: "protocol",
        analysisData: null,
        protocolData: {
          ...resultData,
          fieldsWithLabels,
        },
      };
    }

    return { resultType: null, analysisData: null, protocolData: null };
  }

  /**
   * Get service order data for template
   */
  async getServiceOrderData(serviceOrderId: string) {
    const serviceOrder = await this.serviceOrderService.findOne(serviceOrderId);

    const organization = await this.prisma.organization.findUnique({
      where: { id: serviceOrder.organizationId },
    });

    const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const statusLabels: Record<OrderStatus, string> = {
      [OrderStatus.ORDERED]: "Назначено",
      [OrderStatus.IN_PROGRESS]: "Выполняется",
      [OrderStatus.COMPLETED]: "Выполнено",
      [OrderStatus.CANCELLED]: "Отменено",
    };

    const statusBadgeClasses: Record<OrderStatus, string> = {
      [OrderStatus.COMPLETED]: "badge badge-success",
      [OrderStatus.ORDERED]: "badge badge-info",
      [OrderStatus.IN_PROGRESS]: "badge badge-warning",
      [OrderStatus.CANCELLED]: "badge badge-error",
    };

    // Parse result data with patient info for reference ranges
    const { resultType, analysisData, protocolData } = this.parseResultData(
      serviceOrder.resultData,
      serviceOrder.patient
    );

    // Determine final result type (text if no structured data)
    const finalResultType =
      resultType || (serviceOrder.resultText ? "text" : null);

    return {
      organization,
      serviceOrder: {
        ...serviceOrder,
        createdAtFormatted: dateTimeFormatter.format(serviceOrder.createdAt),
        resultAtFormatted: serviceOrder.resultAt
          ? dateTimeFormatter.format(serviceOrder.resultAt)
          : null,
        statusLabel: statusLabels[serviceOrder.status] ?? serviceOrder.status,
        statusBadgeClass:
          statusBadgeClasses[serviceOrder.status] ?? "badge badge-primary",
        patient: {
          ...serviceOrder.patient,
          dateOfBirthFormatted: (serviceOrder.patient as any).dateOfBirth
            ? dateFormatter.format((serviceOrder.patient as any).dateOfBirth)
            : null,
        },
        // Add parsed result data
        resultType: finalResultType,
        analysisData,
        protocolData,
      },
    };
  }

  /**
   * Render service order template to HTML string for PDF generation
   */
  async renderServiceOrder(serviceOrderId: string): Promise<string> {
    // Получаем данные для шаблона
    const data = await this.getServiceOrderData(serviceOrderId);

    // Читаем шаблон (из dist папки после компиляции)
    const templatePath = join(__dirname, "templates", "service-order.hbs");
    const templateContent = await readFile(templatePath, "utf-8");

    // Компилируем и рендерим
    const template = Handlebars.compile(templateContent);
    const html = template(data);

    // Добавляем inline стили для PDF
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            ${await this.getInvoiceStyles()}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }
}
