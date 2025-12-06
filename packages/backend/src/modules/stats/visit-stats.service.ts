import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";
import { VisitStatsQueryDto } from "./dto/visit-stats-query.dto";
import {
  VisitStatsResponseDto,
  VisitStatusDistributionDto,
  VisitMonthlyTrendDto,
} from "./dto/visit-stats-response.dto";
import { VisitStatus } from "@prisma/client";

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

@Injectable()
export class VisitStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisitStats(dto: VisitStatsQueryDto): Promise<VisitStatsResponseDto> {
    const { organizationId } = dto;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalVisits,
      visitsThisMonth,
      visitsLastMonth,
      completedVisits,
      statusCounts,
      avgTimes,
      monthlyTrends,
    ] = await Promise.all([
      this.getTotalVisits(organizationId),
      this.getVisitsForPeriod(organizationId, startOfThisMonth, now),
      this.getVisitsForPeriod(organizationId, startOfLastMonth, endOfLastMonth),
      this.getCompletedVisits(organizationId),
      this.getStatusCounts(organizationId),
      this.getAverageTimes(organizationId),
      this.getMonthlyTrends(organizationId),
    ]);

    const growthPercent =
      visitsLastMonth > 0
        ? Math.round(
            ((visitsThisMonth - visitsLastMonth) / visitsLastMonth) * 100
          )
        : visitsThisMonth > 0
          ? 100
          : 0;

    const completionRate =
      totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

    const statusDistribution = this.calculateStatusDistribution(
      statusCounts,
      totalVisits
    );

    return plainToInstance(VisitStatsResponseDto, {
      totalVisits,
      visitsThisMonth,
      visitsLastMonth,
      growthPercent,
      completedVisits,
      completionRate,
      avgWaitingTimeMinutes: Math.round(avgTimes.avgWaitingTime ?? 0),
      avgServiceTimeMinutes: Math.round(avgTimes.avgServiceTime ?? 0),
      statusDistribution,
      monthlyTrends,
    });
  }

  private async getTotalVisits(organizationId: string): Promise<number> {
    return this.prisma.visit.count({
      where: { organizationId },
    });
  }

  private async getVisitsForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.prisma.visit.count({
      where: {
        organizationId,
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  private async getCompletedVisits(organizationId: string): Promise<number> {
    return this.prisma.visit.count({
      where: {
        organizationId,
        status: VisitStatus.COMPLETED,
      },
    });
  }

  private async getStatusCounts(
    organizationId: string
  ): Promise<{ status: VisitStatus; count: number }[]> {
    const result = await this.prisma.visit.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { status: true },
    });

    return result.map((r) => ({
      status: r.status,
      count: r._count.status,
    }));
  }

  private async getAverageTimes(
    organizationId: string
  ): Promise<{ avgWaitingTime: number | null; avgServiceTime: number | null }> {
    const result = await this.prisma.visit.aggregate({
      where: {
        organizationId,
        status: VisitStatus.COMPLETED,
      },
      _avg: {
        waitingTimeMinutes: true,
        serviceTimeMinutes: true,
      },
    });

    return {
      avgWaitingTime: result._avg.waitingTimeMinutes,
      avgServiceTime: result._avg.serviceTimeMinutes,
    };
  }

  private async getMonthlyTrends(
    organizationId: string
  ): Promise<VisitMonthlyTrendDto[]> {
    const now = new Date();
    const trends: VisitMonthlyTrendDto[] = [];

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

      const [visitsCount, completedCount] = await Promise.all([
        this.prisma.visit.count({
          where: {
            organizationId,
            visitDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        this.prisma.visit.count({
          where: {
            organizationId,
            visitDate: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: VisitStatus.COMPLETED,
          },
        }),
      ]);

      trends.push(
        plainToInstance(VisitMonthlyTrendDto, {
          month: MONTHS_RU[monthDate.getMonth()],
          monthShort: MONTHS_SHORT_RU[monthDate.getMonth()],
          year: monthDate.getFullYear(),
          visitsCount,
          completedCount,
        })
      );
    }

    return trends;
  }

  private calculateStatusDistribution(
    statusCounts: { status: VisitStatus; count: number }[],
    total: number
  ): VisitStatusDistributionDto {
    const waiting =
      statusCounts.find((s) => s.status === VisitStatus.WAITING)?.count ?? 0;
    const inProgress =
      statusCounts.find((s) => s.status === VisitStatus.IN_PROGRESS)?.count ??
      0;
    const completed =
      statusCounts.find((s) => s.status === VisitStatus.COMPLETED)?.count ?? 0;
    const canceled =
      statusCounts.find((s) => s.status === VisitStatus.CANCELED)?.count ?? 0;

    return plainToInstance(VisitStatusDistributionDto, {
      waiting,
      inProgress,
      completed,
      canceled,
      waitingPercent: total > 0 ? Math.round((waiting / total) * 100) : 0,
      inProgressPercent: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      canceledPercent: total > 0 ? Math.round((canceled / total) * 100) : 0,
    });
  }
}
