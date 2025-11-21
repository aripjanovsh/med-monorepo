import { Injectable } from "@nestjs/common";
import { InvoiceService } from "../invoice/invoice.service";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PaymentStatus } from "@prisma/client";

@Injectable()
export class HtmlService {
  constructor(
    private readonly invoiceService: InvoiceService,
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
}
