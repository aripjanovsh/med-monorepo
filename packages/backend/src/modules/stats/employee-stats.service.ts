import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, VisitStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  StatsPeriod,
  EmployeeStatsQueryDto,
} from "./dto/employee-stats-query.dto";
import { EmployeeStatsResponseDto } from "./dto/employee-stats-response.dto";

@Injectable()
export class EmployeeStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(
    query: EmployeeStatsQueryDto
  ): Promise<EmployeeStatsResponseDto> {
    const { employeeId, organizationId, period = StatsPeriod.MONTH } = query;

    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Calculate period dates
    const { periodStart, periodEnd, previousPeriodStart, previousPeriodEnd } =
      this.#calculatePeriodDates(period);

    // Base where clause for current period
    const visitWhere: Prisma.VisitWhereInput = {
      employeeId,
      organizationId,
      visitDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    // Previous period where clause for trend calculation
    const previousVisitWhere: Prisma.VisitWhereInput = {
      employeeId,
      organizationId,
      visitDate: {
        gte: previousPeriodStart,
        lte: previousPeriodEnd,
      },
    };

    // Fetch all data in parallel
    const [
      // Current period visit counts
      totalVisits,
      completedVisits,
      canceledVisits,
      inProgressVisits,
      waitingVisits,
      // Previous period visits for trend
      previousTotalVisits,
      previousCompletedVisits,
      // Service orders
      totalServiceOrders,
      completedServiceOrders,
      // Prescriptions
      totalPrescriptions,
      // Patients
      assignedPatients,
      newPatientsThisPeriod,
      // Visit aggregates for time stats
      visitTimeAggregates,
      // Revenue from invoices
      invoiceAggregates,
      previousInvoiceAggregates,
      // Visits by month for chart
      visitsByPeriod,
    ] = await Promise.all([
      // Visit counts
      this.prisma.visit.count({ where: visitWhere }),
      this.prisma.visit.count({
        where: { ...visitWhere, status: VisitStatus.COMPLETED },
      }),
      this.prisma.visit.count({
        where: { ...visitWhere, status: VisitStatus.CANCELED },
      }),
      this.prisma.visit.count({
        where: { ...visitWhere, status: VisitStatus.IN_PROGRESS },
      }),
      this.prisma.visit.count({
        where: { ...visitWhere, status: VisitStatus.WAITING },
      }),
      // Previous period
      this.prisma.visit.count({ where: previousVisitWhere }),
      this.prisma.visit.count({
        where: { ...previousVisitWhere, status: VisitStatus.COMPLETED },
      }),
      // Service orders
      this.prisma.serviceOrder.count({
        where: {
          doctorId: employeeId,
          organizationId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      this.prisma.serviceOrder.count({
        where: {
          doctorId: employeeId,
          organizationId,
          status: "COMPLETED",
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      // Prescriptions
      this.prisma.prescription.count({
        where: {
          createdById: employeeId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      // Assigned patients (all time active)
      this.prisma.patientDoctor.count({
        where: {
          employeeId,
          isActive: true,
        },
      }),
      // New patients this period
      this.prisma.patientDoctor.count({
        where: {
          employeeId,
          assignedAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      // Time aggregates
      this.prisma.visit.aggregate({
        where: { ...visitWhere, status: VisitStatus.COMPLETED },
        _avg: {
          serviceTimeMinutes: true,
          waitingTimeMinutes: true,
        },
      }),
      // Revenue aggregates - from invoices linked to employee's visits
      this.prisma.invoice.aggregate({
        where: {
          organizationId,
          visit: {
            employeeId,
            visitDate: { gte: periodStart, lte: periodEnd },
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          organizationId,
          visit: {
            employeeId,
            visitDate: { gte: previousPeriodStart, lte: previousPeriodEnd },
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // Visits grouped by period for chart
      this.#getVisitsGroupedByPeriod(
        employeeId,
        organizationId,
        periodStart,
        periodEnd,
        period
      ),
    ]);

    // Calculate financial stats
    const totalRevenue = Number(invoiceAggregates._sum.totalAmount ?? 0);
    const previousRevenue = Number(
      previousInvoiceAggregates._sum.totalAmount ?? 0
    );
    const avgRevenuePerVisit =
      completedVisits > 0 ? totalRevenue / completedVisits : 0;

    // Calculate efficiency stats
    const completionRate =
      totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
    const previousCompletionRate =
      previousTotalVisits > 0
        ? (previousCompletedVisits / previousTotalVisits) * 100
        : 0;

    // Calculate trends
    const visitsTrend = this.#calculateTrend(totalVisits, previousTotalVisits);
    const revenueTrend = this.#calculateTrend(totalRevenue, previousRevenue);
    const efficiencyTrend = this.#calculateTrend(
      completionRate,
      previousCompletionRate
    );

    // Get revenue chart data
    const revenueChart = await this.#getRevenueGroupedByPeriod(
      employeeId,
      organizationId,
      periodStart,
      periodEnd,
      period
    );

    return {
      period,
      periodStart,
      periodEnd,
      visits: {
        total: totalVisits,
        completed: completedVisits,
        canceled: canceledVisits,
        inProgress: inProgressVisits,
        waiting: waitingVisits,
      },
      time: {
        avgServiceTimeMinutes: Math.round(
          Number(visitTimeAggregates._avg.serviceTimeMinutes) ?? 0
        ),
        avgWaitingTimeMinutes: Math.round(
          Number(visitTimeAggregates._avg.waitingTimeMinutes) ?? 0
        ),
      },
      activity: {
        totalServiceOrders,
        completedServiceOrders,
        totalPrescriptions,
        assignedPatients,
        newPatientsThisPeriod,
      },
      financial: {
        totalRevenue,
        avgRevenuePerVisit: Math.round(avgRevenuePerVisit),
      },
      efficiency: {
        completionRate: Math.round(completionRate * 10) / 10,
      },
      visitsChart: visitsByPeriod,
      revenueChart,
      genderChart: await this.#getPatientsGroupedByGender(
        employeeId,
        organizationId,
        periodStart,
        periodEnd,
        period
      ),
      visitsTrend: Math.round(visitsTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      efficiencyTrend: Math.round(efficiencyTrend * 10) / 10,
    };
  }

  #calculatePeriodDates(period: StatsPeriod): {
    periodStart: Date;
    periodEnd: Date;
    previousPeriodStart: Date;
    previousPeriodEnd: Date;
  } {
    const now = new Date();
    const periodEnd = new Date(now);
    let periodStart: Date;
    let periodDays: number;

    switch (period) {
      case StatsPeriod.WEEK:
        periodDays = 7;
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 7);
        break;
      case StatsPeriod.MONTH:
        periodDays = 30;
        periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case StatsPeriod.THREE_MONTHS:
        periodDays = 90;
        periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case StatsPeriod.SIX_MONTHS:
        periodDays = 180;
        periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - 6);
        break;
      case StatsPeriod.YEAR:
        periodDays = 365;
        periodStart = new Date(now);
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodDays = 30;
        periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - 1);
    }

    // Previous period (same duration, before current period)
    const previousPeriodEnd = new Date(periodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

    return {
      periodStart,
      periodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    };
  }

  #calculateTrend(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  async #getVisitsGroupedByPeriod(
    employeeId: string,
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    period: StatsPeriod
  ) {
    const visits = await this.prisma.visit.findMany({
      where: {
        employeeId,
        organizationId,
        visitDate: { gte: periodStart, lte: periodEnd },
      },
      select: {
        visitDate: true,
        status: true,
      },
    });

    // Generate all labels for the period with zeros
    const allLabels = this.#generatePeriodLabels(
      periodStart,
      periodEnd,
      period
    );
    const groupedData = new Map<
      string,
      { completed: number; canceled: number }
    >();

    // Initialize all labels with zeros
    for (const label of allLabels) {
      groupedData.set(label, { completed: 0, canceled: 0 });
    }

    // Fill in actual data
    for (const visit of visits) {
      const label = this.#getGroupLabel(visit.visitDate, period);
      const data = groupedData.get(label);
      if (data) {
        if (visit.status === VisitStatus.COMPLETED) {
          data.completed++;
        } else if (visit.status === VisitStatus.CANCELED) {
          data.canceled++;
        }
      }
    }

    // Convert to array maintaining order
    return allLabels.map((label) => ({
      label,
      completed: groupedData.get(label)?.completed ?? 0,
      canceled: groupedData.get(label)?.canceled ?? 0,
    }));
  }

  async #getRevenueGroupedByPeriod(
    employeeId: string,
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    period: StatsPeriod
  ) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        visit: {
          employeeId,
          visitDate: { gte: periodStart, lte: periodEnd },
        },
      },
      select: {
        visit: {
          select: {
            visitDate: true,
          },
        },
        totalAmount: true,
      },
    });

    // Generate all labels for the period with zeros
    const allLabels = this.#generatePeriodLabels(
      periodStart,
      periodEnd,
      period
    );
    const groupedData = new Map<string, number>();

    // Initialize all labels with zeros
    for (const label of allLabels) {
      groupedData.set(label, 0);
    }

    // Fill in actual data
    for (const invoice of invoices) {
      if (invoice.visit?.visitDate) {
        const label = this.#getGroupLabel(invoice.visit.visitDate, period);
        const current = groupedData.get(label) ?? 0;
        groupedData.set(label, current + Number(invoice.totalAmount));
      }
    }

    // Convert to array maintaining order
    return allLabels.map((label) => ({
      label,
      revenue: groupedData.get(label) ?? 0,
    }));
  }

  async #getPatientsGroupedByGender(
    employeeId: string,
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    period: StatsPeriod
  ) {
    // Get visits with patient gender info
    const visits = await this.prisma.visit.findMany({
      where: {
        employeeId,
        organizationId,
        visitDate: { gte: periodStart, lte: periodEnd },
      },
      select: {
        visitDate: true,
        patient: {
          select: {
            gender: true,
          },
        },
      },
    });

    // Generate all labels for the period
    const allLabels = this.#generatePeriodLabels(
      periodStart,
      periodEnd,
      period
    );
    const groupedData = new Map<string, { male: number; female: number }>();

    // Initialize all labels with zeros
    for (const label of allLabels) {
      groupedData.set(label, { male: 0, female: 0 });
    }

    // Fill in actual data
    for (const visit of visits) {
      const label = this.#getGroupLabel(visit.visitDate, period);
      const data = groupedData.get(label);
      if (data && visit.patient?.gender) {
        if (visit.patient.gender === "MALE") {
          data.male++;
        } else if (visit.patient.gender === "FEMALE") {
          data.female++;
        }
      }
    }

    // Convert to array maintaining order
    return allLabels.map((label) => ({
      label,
      male: groupedData.get(label)?.male ?? 0,
      female: groupedData.get(label)?.female ?? 0,
    }));
  }

  #generatePeriodLabels(
    periodStart: Date,
    periodEnd: Date,
    period: StatsPeriod
  ): string[] {
    const labels: string[] = [];
    const current = new Date(periodStart);

    switch (period) {
      case StatsPeriod.WEEK:
      case StatsPeriod.MONTH:
        // Group by day
        while (current <= periodEnd) {
          labels.push(this.#getGroupLabel(current, period));
          current.setDate(current.getDate() + 1);
        }
        break;
      case StatsPeriod.THREE_MONTHS:
      case StatsPeriod.SIX_MONTHS:
      case StatsPeriod.YEAR:
        // Group by month
        while (current <= periodEnd) {
          const label = this.#getGroupLabel(current, period);
          if (!labels.includes(label)) {
            labels.push(label);
          }
          current.setMonth(current.getMonth() + 1);
        }
        break;
    }

    return labels;
  }

  #getGroupLabel(date: Date, period: StatsPeriod): string {
    const months = [
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

    switch (period) {
      case StatsPeriod.WEEK:
      case StatsPeriod.MONTH:
        // Group by day (DD.MM format)
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      case StatsPeriod.THREE_MONTHS:
      case StatsPeriod.SIX_MONTHS:
      case StatsPeriod.YEAR:
        // Group by month
        return months[date.getMonth()];
      default:
        return months[date.getMonth()];
    }
  }
}
