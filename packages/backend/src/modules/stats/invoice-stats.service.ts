import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";
import { InvoiceStatsQueryDto } from "./dto/invoice-stats-query.dto";
import {
  InvoiceStatsResponseDto,
  PaymentStatusDistributionDto,
  PaymentMethodDistributionDto,
  InvoiceMonthlyTrendDto,
} from "./dto/invoice-stats-response.dto";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Наличные",
  CARD: "Карта",
  ONLINE: "Онлайн",
  TRANSFER: "Перевод",
};

@Injectable()
export class InvoiceStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInvoiceStats(
    dto: InvoiceStatsQueryDto
  ): Promise<InvoiceStatsResponseDto> {
    const { organizationId } = dto;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalInvoices,
      aggregates,
      revenueThisMonth,
      revenueLastMonth,
      statusCounts,
      paymentMethodStats,
      monthlyTrends,
    ] = await Promise.all([
      this.getTotalInvoices(organizationId),
      this.getAggregates(organizationId),
      this.getRevenueForPeriod(organizationId, startOfThisMonth, now),
      this.getRevenueForPeriod(
        organizationId,
        startOfLastMonth,
        endOfLastMonth
      ),
      this.getStatusCounts(organizationId),
      this.getPaymentMethodStats(organizationId),
      this.getMonthlyTrends(organizationId),
    ]);

    const totalRevenue = Number(aggregates._sum.totalAmount ?? 0);
    const totalCollected = Number(aggregates._sum.paidAmount ?? 0);
    const totalOutstanding = totalRevenue - totalCollected;
    const averageInvoiceAmount =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    const growthPercent =
      revenueLastMonth > 0
        ? Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          )
        : revenueThisMonth > 0
          ? 100
          : 0;

    const statusDistribution = this.calculateStatusDistribution(
      statusCounts,
      totalInvoices
    );

    const paymentMethodDistribution =
      this.calculatePaymentMethodDistribution(paymentMethodStats);

    return plainToInstance(InvoiceStatsResponseDto, {
      totalInvoices,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
      growthPercent,
      averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
      statusDistribution,
      paymentMethodDistribution,
      monthlyTrends,
    });
  }

  private async getTotalInvoices(organizationId: string): Promise<number> {
    return this.prisma.invoice.count({
      where: { organizationId },
    });
  }

  private async getAggregates(organizationId: string) {
    return this.prisma.invoice.aggregate({
      where: { organizationId },
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
    });
  }

  private async getRevenueForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  private async getStatusCounts(
    organizationId: string
  ): Promise<{ status: PaymentStatus; count: number }[]> {
    const result = await this.prisma.invoice.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { status: true },
    });

    return result.map((r) => ({
      status: r.status,
      count: r._count.status,
    }));
  }

  private async getPaymentMethodStats(
    organizationId: string
  ): Promise<{ method: PaymentMethod; count: number; amount: number }[]> {
    const result = await this.prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        invoice: { organizationId },
      },
      _count: { paymentMethod: true },
      _sum: { amount: true },
    });

    return result.map((r) => ({
      method: r.paymentMethod,
      count: r._count.paymentMethod,
      amount: Number(r._sum.amount ?? 0),
    }));
  }

  private async getMonthlyTrends(
    organizationId: string
  ): Promise<InvoiceMonthlyTrendDto[]> {
    const now = new Date();
    const trends: InvoiceMonthlyTrendDto[] = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthStart = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const [countResult, revenueResult] = await Promise.all([
        this.prisma.invoice.count({
          where: {
            organizationId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        this.prisma.invoice.aggregate({
          where: {
            organizationId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            paidAmount: true,
          },
        }),
      ]);

      trends.push(
        plainToInstance(InvoiceMonthlyTrendDto, {
          month: MONTHS_RU[monthDate.getMonth()],
          monthShort: MONTHS_SHORT_RU[monthDate.getMonth()],
          year: monthDate.getFullYear(),
          invoicesCount: countResult,
          revenue:
            Math.round(Number(revenueResult._sum.paidAmount ?? 0) * 100) / 100,
        })
      );
    }

    return trends;
  }

  private calculateStatusDistribution(
    statusCounts: { status: PaymentStatus; count: number }[],
    total: number
  ): PaymentStatusDistributionDto {
    const unpaid =
      statusCounts.find((s) => s.status === PaymentStatus.UNPAID)?.count ?? 0;
    const partiallyPaid =
      statusCounts.find((s) => s.status === PaymentStatus.PARTIALLY_PAID)
        ?.count ?? 0;
    const paid =
      statusCounts.find((s) => s.status === PaymentStatus.PAID)?.count ?? 0;

    return plainToInstance(PaymentStatusDistributionDto, {
      unpaid,
      partiallyPaid,
      paid,
      unpaidPercent: total > 0 ? Math.round((unpaid / total) * 100) : 0,
      partiallyPaidPercent:
        total > 0 ? Math.round((partiallyPaid / total) * 100) : 0,
      paidPercent: total > 0 ? Math.round((paid / total) * 100) : 0,
    });
  }

  private calculatePaymentMethodDistribution(
    stats: { method: PaymentMethod; count: number; amount: number }[]
  ): PaymentMethodDistributionDto[] {
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

    return stats.map((s) =>
      plainToInstance(PaymentMethodDistributionDto, {
        method: PAYMENT_METHOD_LABELS[s.method] ?? s.method,
        count: s.count,
        amount: Math.round(s.amount * 100) / 100,
        percent: totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0,
      })
    );
  }
}
