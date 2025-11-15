import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";
import { StatsQueryDto, StatsType } from "./dto/stats-query.dto";
import { StatsResponseDto } from "./dto/stat-response.dto";
import { AppointmentStatus, VisitStatus, PaymentStatus } from "@prisma/client";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(dto: StatsQueryDto): Promise<StatsResponseDto> {
    const {
      organizationId,
      types,
      startDate: startDateStr,
      endDate: endDateStr,
    } = dto;

    // Parse dates or use today
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    // Set time boundaries
    const startOfPeriod = new Date(startDate.setHours(0, 0, 0, 0));
    const endOfPeriod = new Date(endDate.setHours(23, 59, 59, 999));

    // Determine which stats to fetch
    const typesToFetch = types || Object.values(StatsType);

    // Build promises for requested stats
    const statsPromises: Record<string, Promise<number>> = {};

    for (const type of typesToFetch) {
      switch (type) {
        case StatsType.PATIENTS_COUNT:
          statsPromises[type] = this.getPatientsCount(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.VISITS_COUNT:
          statsPromises[type] = this.getVisitsCount(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.APPOINTMENTS_COUNT:
          statsPromises[type] = this.getAppointmentsCount(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.REVENUE_TOTAL:
          statsPromises[type] = this.getRevenueTotal(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.UNPAID_INVOICES_COUNT:
          statsPromises[type] = this.getUnpaidInvoicesCount(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.PATIENTS_IN_QUEUE:
          statsPromises[type] = this.getPatientsInQueue(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.COMPLETED_VISITS:
          statsPromises[type] = this.getCompletedVisits(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.CANCELED_APPOINTMENTS:
          statsPromises[type] = this.getCanceledAppointments(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
        case StatsType.NO_SHOW_APPOINTMENTS:
          statsPromises[type] = this.getNoShowAppointments(
            organizationId,
            startOfPeriod,
            endOfPeriod
          );
          break;
      }
    }

    // Execute all promises in parallel
    const statsEntries = await Promise.all(
      Object.entries(statsPromises).map(async ([key, promise]) => [
        key,
        await promise,
      ])
    );

    const stats = Object.fromEntries(statsEntries);

    return plainToInstance(StatsResponseDto, {
      startDate: startOfPeriod.toISOString(),
      endDate: endOfPeriod.toISOString(),
      stats,
    });
  }

  private async getPatientsCount(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfPeriod, lte: endOfPeriod },
      },
    });
  }

  private async getVisitsCount(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.visit.count({
      where: {
        organizationId,
        visitDate: { gte: startOfPeriod, lte: endOfPeriod },
      },
    });
  }

  private async getAppointmentsCount(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfPeriod, lte: endOfPeriod },
      },
    });
  }

  private async getRevenueTotal(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        organizationId,
        createdAt: { gte: startOfPeriod, lte: endOfPeriod },
      },
      _sum: { paidAmount: true },
    });
    return result._sum.paidAmount?.toNumber() ?? 0;
  }

  private async getUnpaidInvoicesCount(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.invoice.count({
      where: {
        organizationId,
        createdAt: { gte: startOfPeriod, lte: endOfPeriod },
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID],
        },
      },
    });
  }

  private async getPatientsInQueue(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfPeriod, lte: endOfPeriod },
        status: AppointmentStatus.IN_QUEUE,
        checkInAt: { not: null },
      },
    });
  }

  private async getCompletedVisits(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.visit.count({
      where: {
        organizationId,
        visitDate: { gte: startOfPeriod, lte: endOfPeriod },
        status: VisitStatus.COMPLETED,
      },
    });
  }

  private async getCanceledAppointments(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfPeriod, lte: endOfPeriod },
        status: AppointmentStatus.CANCELLED,
      },
    });
  }

  private async getNoShowAppointments(
    organizationId: string,
    startOfPeriod: Date,
    endOfPeriod: Date
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfPeriod, lte: endOfPeriod },
        status: AppointmentStatus.NO_SHOW,
      },
    });
  }
}
